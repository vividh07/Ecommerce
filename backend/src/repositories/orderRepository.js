import mongoose from 'mongoose';
import { Order } from '../models/Order.js';

export const orderRepository = {
  async create(data, session) {
    const order = new Order(data);
    return order.save(session ? { session } : undefined);
  },
  async findById(id, userId) {
    const filter = { _id: id, isDeleted: false };
    if (userId) filter.userId = userId;
    return Order.findOne(filter);
  },
  async findByIdAdmin(id) {
    return Order.findOne({ _id: id, isDeleted: false }).populate('userId', 'name email role');
  },
  async findByRazorpayOrderId(razorpayOrderId) {
    return Order.findOne({ razorpayOrderId, isDeleted: false });
  },
  async setRazorpayOrderId(orderId, razorpayOrderId, session) {
    return Order.findByIdAndUpdate(
      orderId,
      { razorpayOrderId },
      { new: true, session }
    );
  },
  async listByUser(userId, { skip, limit }) {
    // Hide unpaid checkout drafts — only real payment outcomes (and refunds).
    const filter = {
      userId,
      isDeleted: false,
      paymentStatus: { $in: ['PAID', 'REFUNDED'] },
    };
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
  async markPaid(orderId, razorpayPaymentId, session) {
    const update = { paymentStatus: 'PAID' };
    if (razorpayPaymentId) update.razorpayPaymentId = razorpayPaymentId;
    return Order.findByIdAndUpdate(orderId, update, { new: true, session });
  },
  async updateStatus(orderId, status, session) {
    return Order.findByIdAndUpdate(orderId, { status }, { new: true, session });
  },
  async updatePaymentStatusByRazorpayOrder(razorpayOrderId, paymentStatus, session, orderId) {
    const filter = orderId
      ? { _id: orderId }
      : { razorpayOrderId };
    const update = { paymentStatus };
    if (paymentStatus === 'FAILED') {
      update.status = 'CANCELLED';
    }
    return Order.findOneAndUpdate(filter, update, { new: true, session });
  },
  async cancelUnpaid(orderId) {
    return Order.findOneAndUpdate(
      {
        _id: orderId,
        paymentStatus: { $in: ['PENDING', 'FAILED'] },
      },
      { paymentStatus: 'FAILED', status: 'CANCELLED' },
      { new: true }
    );
  },
};
