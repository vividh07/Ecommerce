import { Order } from '../models/Order.js';

export const orderRepository = {
  async create(data, session) {
    const order = new Order(data);
    return order.save({ session });
  },
  async findById(id, userId) {
    const filter = { _id: id, isDeleted: false };
    if (userId) filter.userId = userId;
    return Order.findOne(filter);
  },
  async findByPaymentIntent(paymentIntentId) {
    return Order.findOne({ stripePaymentIntentId: paymentIntentId });
  },
  async listByUser(userId, { skip, limit }) {
    const filter = { userId, isDeleted: false };
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return { items, total };
  },
  async listBySeller(sellerId, { skip, limit }) {
    const filter = { isDeleted: false, 'items.sellerId': sellerId };
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);
    return { items, total };
  },
  async markPaid(orderId, session) {
    return Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'PAID' },
      { new: true, session }
    );
  },
  async updateStatus(orderId, status, session) {
    return Order.findByIdAndUpdate(orderId, { status }, { new: true, session });
  },
  async updatePaymentStatusByIntent(paymentIntentId, paymentStatus, session) {
    return Order.findOneAndUpdate(
      { stripePaymentIntentId: paymentIntentId },
      { paymentStatus },
      { new: true, session }
    );
  },
};
