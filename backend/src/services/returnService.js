import { ApiError } from '../utils/ApiError.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { returnRequestRepository } from '../repositories/returnRequestRepository.js';
import { orderStatusHistoryRepository } from '../repositories/orderStatusHistoryRepository.js';
import { sellerRepository } from '../repositories/sellerRepository.js';
import { getIo } from '../socket/io.js';
import { accountService } from './accountService.js';

export const returnService = {
  async requestReturn(userId, orderId, { variantId, reason, notes, action }) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) throw new ApiError(404, 'Order not found');
    if (order.paymentStatus !== 'PAID') {
      throw new ApiError(400, 'Only paid orders can be returned');
    }
    if (order.status !== 'DELIVERED') {
      throw new ApiError(400, 'Returns are available after delivery');
    }

    const item = order.items.find((i) => String(i.variantId) === String(variantId));
    if (!item) throw new ApiError(400, 'Item not found on this order');

    if (item.returnDeadline && new Date(item.returnDeadline) < new Date()) {
      throw new ApiError(400, 'Return window has expired for this item');
    }

    const existing = await returnRequestRepository.findOpenForOrderItem(orderId, variantId);
    if (existing) {
      throw new ApiError(409, 'A return is already in progress for this item');
    }

    const doc = await returnRequestRepository.create({
      orderId: order._id,
      userId,
      sellerId: item.sellerId,
      variantId: item.variantId,
      productId: item.productId,
      productName: item.productName,
      variantLabel: item.variantLabel || '',
      quantity: item.quantity,
      lineTotal: item.lineTotal,
      reason,
      notes: notes || '',
      action: action === 'exchange' ? 'exchange' : 'return',
      status: 'REQUESTED',
      refundAmount: action === 'exchange' ? 0 : item.lineTotal,
    });

    await orderStatusHistoryRepository.add({
      orderId: order._id,
      status: order.status,
      note: `Return requested for ${item.productName}: ${reason}`,
      sellerId: item.sellerId,
      timestamp: new Date(),
    });

    const seller = await sellerRepository.findById(item.sellerId);
    if (seller?.userId) {
      await accountService.pushNotification(seller.userId, {
        title: 'New return request',
        body: `${item.productName} — ${reason}`,
        href: '/seller/returns',
      });
    }

    await accountService.pushNotification(userId, {
      title: 'Return request submitted',
      body: `We received your return request for ${item.productName}.`,
      href: `/orders/${order._id}`,
    });

    const io = getIo();
    if (io) {
      io.to(`user:${userId}`).emit('order:updated', {
        orderId: order._id.toString(),
        status: order.status,
      });
      if (seller?.userId) {
        io.to(`user:${seller.userId}`).emit('notification:new', { title: 'New return request' });
      }
    }

    return doc;
  },

  async approveReturn(userId, returnId) {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller) throw new ApiError(404, 'Seller profile not found');
    if (!seller.isApproved) throw new ApiError(403, 'Seller account pending approval');

    const updated = await returnRequestRepository.updateStatus(returnId, seller._id, 'APPROVED');
    if (!updated) throw new ApiError(404, 'Return request not found');

    await accountService.pushNotification(updated.userId, {
      title: 'Return approved',
      body: `Your return for ${updated.productName} was approved.`,
      href: `/orders/${updated.orderId}`,
    });

    return updated;
  },
};
