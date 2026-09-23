import { ReturnRequest } from '../models/ReturnRequest.js';

export const returnRequestRepository = {
  async create(data) {
    return ReturnRequest.create(data);
  },
  async findById(id) {
    return ReturnRequest.findById(id);
  },
  async findOpenForOrderItem(orderId, variantId) {
    return ReturnRequest.findOne({
      orderId,
      variantId,
      status: { $nin: ['REJECTED', 'REFUNDED', 'RETURNED'] },
    });
  },
  async listBySeller(sellerId, { skip, limit }) {
    const filter = { sellerId };
    const [items, total] = await Promise.all([
      ReturnRequest.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email'),
      ReturnRequest.countDocuments(filter),
    ]);
    return { items, total };
  },
  async countOpenBySeller(sellerId) {
    return ReturnRequest.countDocuments({
      sellerId,
      status: { $in: ['REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'IN_TRANSIT'] },
    });
  },
  async updateStatus(id, sellerId, status, extra = {}) {
    return ReturnRequest.findOneAndUpdate(
      { _id: id, sellerId },
      { status, ...extra },
      { new: true }
    );
  },
};
