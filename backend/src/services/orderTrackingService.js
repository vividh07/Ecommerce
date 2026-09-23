import { ApiError } from '../utils/ApiError.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { orderStatusHistoryRepository } from '../repositories/orderStatusHistoryRepository.js';
import { sellerRepository } from '../repositories/sellerRepository.js';
import { aggregateOrderStatus, canAdvanceStatus } from '../utils/orderStatus.js';
import { getIo } from '../socket/io.js';
import { applyItemPostPurchaseFields } from '../utils/postPurchase.js';
import { accountService } from './accountService.js';

async function logStatus(orderId, status, note, sellerId = null, session) {
  return orderStatusHistoryRepository.add(
    { orderId, status, note, sellerId, timestamp: new Date() },
    session
  );
}

function emitOrderUpdate(userId, order) {
  const io = getIo();
  if (io) {
    io.to(`user:${userId}`).emit('order:updated', {
      orderId: order._id.toString(),
      status: order.status,
      sellerFulfillment: order.sellerFulfillment,
    });
  }
}

export const orderTrackingService = {
  async getHistory(orderId, userId) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) throw new ApiError(404, 'Order not found');
    const history = await orderStatusHistoryRepository.listByOrder(orderId);
    return { order, history };
  },

  async recordInitialPlaced(order, session) {
    await logStatus(order._id, 'PLACED', 'Order placed, awaiting payment', null, session);
  },

  async recordConfirmed(order, session) {
    const fulfillments = order.sellerBreakdown.map((s) => ({
      sellerId: s.sellerId,
      storeName: s.storeName,
      status: 'CONFIRMED',
    }));
    order.sellerFulfillment = fulfillments;
    order.status = 'CONFIRMED';
    await order.save({ session });
    await logStatus(order._id, 'CONFIRMED', 'Payment received', null, session);
    return order;
  },

  async updateSellerStatus(userId, orderId, status, note = '') {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller?.isApproved) throw new ApiError(403, 'Approved seller required');

    const order = await orderRepository.findById(orderId);
    if (!order) throw new ApiError(404, 'Order not found');

    const hasItems = order.items.some((i) => i.sellerId.toString() === seller._id.toString());
    if (!hasItems) throw new ApiError(403, 'No items from your store in this order');

    const entry = order.sellerFulfillment.find((f) => f.sellerId.toString() === seller._id.toString());
    if (!entry) throw new ApiError(400, 'Fulfillment record missing');

    if (!canAdvanceStatus(entry.status, status)) {
      throw new ApiError(400, 'Invalid status transition');
    }

    entry.status = status;
    const statuses = order.sellerFulfillment.map((f) => f.status);
    order.status = aggregateOrderStatus(statuses, order.status);
    if (order.status === 'DELIVERED' && !order.deliveredAt) {
      await applyItemPostPurchaseFields(order);
    }
    await order.save();

    await logStatus(
      order._id,
      status,
      note || `${seller.storeName} updated to ${status}`,
      seller._id
    );

    await accountService.pushNotification(order.userId, {
      title: `Order ${status.replaceAll('_', ' ').toLowerCase()}`,
      body: note || `${seller.storeName} updated your order.`,
      href: `/orders/${order._id}`,
    });

    emitOrderUpdate(order.userId.toString(), order);
    return order;
  },

  async confirmDelivery(userId, orderId) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.paymentStatus !== 'PAID') {
      throw new ApiError(400, 'Only paid orders can be confirmed');
    }
    if (order.status === 'DELIVERED') {
      return order;
    }
    if (!['SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status)) {
      throw new ApiError(400, 'Confirm delivery after the order has shipped');
    }

    for (const entry of order.sellerFulfillment ?? []) {
      if (entry.status !== 'CANCELLED' && entry.status !== 'RETURNED') {
        entry.status = 'DELIVERED';
      }
    }
    order.status = 'DELIVERED';
    if (!order.deliveredAt) {
      await applyItemPostPurchaseFields(order);
    }
    await order.save();

    await logStatus(order._id, 'DELIVERED', 'Customer confirmed delivery', null);
    emitOrderUpdate(order.userId.toString(), order);
    return order;
  },
};
