import { ApiError } from '../utils/ApiError.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { orderStatusHistoryRepository } from '../repositories/orderStatusHistoryRepository.js';
import { sellerRepository } from '../repositories/sellerRepository.js';

export const orderService = {
  async getUserOrder(userId, orderId) {
    const order = await orderRepository.findById(orderId, userId);
    if (!order) throw new ApiError(404, 'Order not found');
    const history = await orderStatusHistoryRepository.listByOrder(orderId);
    return { order, history };
  },

  async listUserOrders(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const { items, total } = await orderRepository.listByUser(userId, { skip, limit });
    return { items, meta: paginationMeta({ page, limit, total }) };
  },

  async listSellerOrders(userId, query) {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller?.isApproved) throw new ApiError(403, 'Approved seller required');
    const { page, limit, skip } = parsePagination(query);
    const { items, total } = await orderRepository.listBySeller(seller._id, { skip, limit });
    const filtered = items.map((order) => ({
      ...order.toObject(),
      items: order.items.filter((i) => i.sellerId.toString() === seller._id.toString()),
      myFulfillment: order.sellerFulfillment?.find(
        (f) => f.sellerId.toString() === seller._id.toString()
      ),
    }));
    return { items: filtered, meta: paginationMeta({ page, limit, total }) };
  },
};
