import mongoose from 'mongoose';
import Stripe from 'stripe';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { cartService } from './cartService.js';
import { cartRepository } from '../repositories/cartRepository.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { variantRepository } from '../repositories/productRepository.js';

const stripe = new Stripe(env.STRIPE_SECRET_KEY);

function variantLabel(attributes) {
  if (!attributes || typeof attributes !== 'object') return '';
  return Object.entries(attributes)
    .map(([k, v]) => `${k}: ${v}`)
    .join(', ');
}

function buildSellerBreakdown(items) {
  const map = new Map();
  for (const item of items) {
    const sid = item.product.sellerId.toString();
    const existing = map.get(sid) || {
      sellerId: item.product.sellerId,
      storeName: item.product.storeName,
      subtotal: 0,
      itemCount: 0,
    };
    existing.subtotal += item.lineTotal;
    existing.itemCount += item.quantity;
    map.set(sid, existing);
  }
  return Array.from(map.values());
}

export const checkoutService = {
  async createPaymentIntent(userId, { shippingAddress }) {
    const cart = await cartService.getCart(userId);
    if (!cart.items.length) throw new ApiError(400, 'Cart is empty');

    for (const item of cart.items) {
      if (item.quantity > item.stock) {
        throw new ApiError(400, `Insufficient stock for ${item.product.name}`);
      }
    }

    const amountCents = Math.round(cart.subtotal * 100);
    if (amountCents < 50) {
      throw new ApiError(400, 'Order total below minimum charge');
    }

    const orderItems = cart.items.map((item) => ({
      variantId: item.variantId,
      productId: item.product.id,
      sellerId: item.product.sellerId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
      productName: item.product.name,
      variantLabel: variantLabel(item.attributes),
    }));

    const sellerBreakdown = buildSellerBreakdown(cart.items);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: userId.toString(),
      },
    });

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await orderRepository.create(
        {
          userId,
          items: orderItems,
          sellerBreakdown,
          shippingAddress,
          status: 'PLACED',
          paymentStatus: 'PENDING',
          stripePaymentIntentId: paymentIntent.id,
          totalAmount: cart.subtotal,
        },
        session
      );
      await session.commitTransaction();
      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        orderId: order._id.toString(),
        amount: cart.subtotal,
      };
    } catch (err) {
      await session.abortTransaction();
      await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {});
      throw err;
    } finally {
      session.endSession();
    }
  },

  async fulfillPaidOrder(paymentIntent) {
    const paymentIntentId = paymentIntent.id;
    const order = await orderRepository.findByPaymentIntent(paymentIntentId);
    if (!order) return null;
    if (order.paymentStatus === 'PAID') return order;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      for (const item of order.items) {
        const updated = await variantRepository.decrementStock(
          item.variantId,
          item.quantity,
          session
        );
        if (!updated) {
          throw new ApiError(409, 'Stock changed during checkout');
        }
      }

      const paidOrder = await orderRepository.markPaid(order._id, session);
      await cartRepository.clear(order.userId);
      await session.commitTransaction();
      return paidOrder;
    } catch (err) {
      await session.abortTransaction();
      await orderRepository.updatePaymentStatusByIntent(paymentIntentId, 'FAILED');
      throw err;
    } finally {
      session.endSession();
    }
  },

  async handlePaymentFailed(paymentIntentId) {
    return orderRepository.updatePaymentStatusByIntent(paymentIntentId, 'FAILED');
  },
};

export function constructStripeEvent(rawBody, signature) {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new ApiError(500, 'Stripe webhook secret not configured');
  }
  return stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
}
