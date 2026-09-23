import crypto from 'crypto';
import Razorpay from 'razorpay';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { withTransaction } from '../utils/withTransaction.js';
import { cartService } from './cartService.js';
import { couponService } from './couponService.js';
import { cartRepository } from '../repositories/cartRepository.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { couponRepository } from '../repositories/couponRepository.js';
import { variantRepository } from '../repositories/productRepository.js';
import { orderTrackingService } from './orderTrackingService.js';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

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

function verifyPaymentSignature(orderId, paymentId, signature) {
  const body = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
}

export function verifyWebhookSignature(rawBody, signature) {
  if (!env.RAZORPAY_WEBHOOK_SECRET) {
    throw new ApiError(500, 'Razorpay webhook secret not configured');
  }
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return expected === signature;
}

export const checkoutService = {
  async createRazorpayOrder(userId, { shippingAddress, cartId, couponCode }) {
    const cart = await cartService.getCart(userId, cartId);
    if (!cart.items.length) throw new ApiError(400, 'Cart is empty');

    for (const item of cart.items) {
      if (item.quantity > item.stock) {
        throw new ApiError(400, `Insufficient stock for ${item.product.name}`);
      }
    }

    const sellerIds = cart.items.map((i) => i.product.sellerId);
    let discountAmount = 0;
    let coupon = null;
    if (couponCode) {
      const applied = await couponService.validateForCheckout(
        couponCode,
        cart.subtotal,
        sellerIds
      );
      discountAmount = applied.discountAmount;
      coupon = applied.coupon;
    }

    const totalAmount = Math.max(0, cart.subtotal - discountAmount);
    const amountPaise = Math.round(totalAmount * 100);
    if (amountPaise < 100) {
      throw new ApiError(400, 'Order total below minimum charge (₹1)');
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

    const order = await withTransaction(async (session) => {
      const created = await orderRepository.create(
        {
          userId,
          cartId: cart.id,
          items: orderItems,
          sellerBreakdown,
          shippingAddress,
          status: 'PLACED',
          paymentStatus: 'PENDING',
          razorpayOrderId: null,
          subtotalAmount: cart.subtotal,
          discountAmount,
          couponCode: coupon?.code ?? null,
          couponId: coupon?._id ?? null,
          totalAmount,
        },
        session
      );
      await orderTrackingService.recordInitialPlaced(created, session);
      return created;
    });

    const orderId = order._id.toString();
    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: amountPaise,
        currency: 'INR',
        receipt: orderId.slice(0, 40),
        notes: {
          orderId,
          userId: userId.toString(),
          cartId: cart.id,
        },
      });
    } catch (err) {
      await orderRepository.updatePaymentStatusByRazorpayOrder(null, 'FAILED', null, orderId);
      throw new ApiError(502, err?.error?.description || 'Failed to create Razorpay order');
    }

    await orderRepository.setRazorpayOrderId(order._id, rzpOrder.id);

    return {
      keyId: env.RAZORPAY_KEY_ID,
      razorpayOrderId: rzpOrder.id,
      amount: amountPaise,
      currency: 'INR',
      orderId,
      subtotal: cart.subtotal,
      discountAmount,
      total: totalAmount,
      couponCode: coupon?.code ?? null,
    };
  },

  async verifyAndFulfill(userId, { razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    if (!verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
      throw new ApiError(400, 'Invalid payment signature');
    }

    const order = await orderRepository.findByRazorpayOrderId(razorpay_order_id);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.userId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Order does not belong to this user');
    }

    if (order.paymentStatus === 'PAID') {
      return { orderId: order._id.toString(), alreadyPaid: true };
    }

    const paid = await this.fulfillPaidOrder({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
    });

    return { orderId: paid._id.toString(), alreadyPaid: false };
  },

  async fulfillPaidOrder({ razorpayOrderId, razorpayPaymentId }) {
    const order = await orderRepository.findByRazorpayOrderId(razorpayOrderId);
    if (!order) return null;
    if (order.paymentStatus === 'PAID') return order;

    try {
      return await withTransaction(async (session) => {
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

        if (order.couponId) {
          const updatedCoupon = await couponRepository.incrementUsage(order.couponId, session);
          if (!updatedCoupon) throw new ApiError(409, 'Coupon no longer valid');
        }

        let paidOrder = await orderRepository.markPaid(order._id, razorpayPaymentId, session);
        paidOrder = await orderTrackingService.recordConfirmed(paidOrder, session);

        if (order.cartId) {
          await cartRepository.clear(order.cartId);
        }

        return paidOrder;
      });
    } catch (err) {
      await orderRepository.updatePaymentStatusByRazorpayOrder(razorpayOrderId, 'FAILED');
      throw err;
    }
  },

  async handlePaymentFailed(razorpayOrderId) {
    return orderRepository.updatePaymentStatusByRazorpayOrder(razorpayOrderId, 'FAILED');
  },

  async cancelUnpaidOrder(userId, orderId) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.paymentStatus === 'PAID') {
      throw new ApiError(400, 'Paid orders cannot be cancelled here');
    }
    return orderRepository.cancelUnpaid(orderId);
  },
};
