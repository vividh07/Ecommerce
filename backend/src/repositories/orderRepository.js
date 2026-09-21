import mongoose from 'mongoose';
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
  async findByIdAdmin(id) {
    return Order.findOne({ _id: id, isDeleted: false }).populate('userId', 'name email role');
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
  async listBySeller(sellerId, { skip, limit, filter: extraFilter = {} } = {}) {
    const filter = { isDeleted: false, 'items.sellerId': sellerId, ...extraFilter };
    const [items, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email'),
      Order.countDocuments(filter),
    ]);
    return { items, total };
  },
  async findByIdForSeller(orderId, sellerId) {
    return Order.findOne({
      _id: orderId,
      isDeleted: false,
      'items.sellerId': sellerId,
    }).populate('userId', 'name email');
  },
  async listAdmin({ filter, skip, limit }) {
    const [items, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email'),
      Order.countDocuments(filter),
    ]);
    return { items, total };
  },
  async count(filter = { isDeleted: false }) {
    return Order.countDocuments(filter);
  },
  async sumPaidRevenue(extraFilter = {}) {
    const [result] = await Order.aggregate([
      { $match: { isDeleted: false, paymentStatus: 'PAID', ...extraFilter } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]);
    return { total: result?.total ?? 0, count: result?.count ?? 0 };
  },
  async revenueTrendDaily(since) {
    return Order.aggregate([
      {
        $match: {
          isDeleted: false,
          paymentStatus: 'PAID',
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },
  async recentPaidOrAny(limit = 8) {
    return Order.find({ isDeleted: false })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('userId', 'name email');
  },
  async customerStats(userIds) {
    const ids = userIds.map((id) => new mongoose.Types.ObjectId(id));
    return Order.aggregate([
      { $match: { isDeleted: false, userId: { $in: ids } } },
      {
        $group: {
          _id: '$userId',
          orderCount: { $sum: 1 },
          totalSpent: {
            $sum: {
              $cond: [{ $eq: ['$paymentStatus', 'PAID'] }, '$totalAmount', 0],
            },
          },
          lastOrderAt: { $max: '$createdAt' },
        },
      },
    ]);
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
