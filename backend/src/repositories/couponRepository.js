import { Coupon } from '../models/Coupon.js';

export const couponRepository = {
  async findByCode(code) {
    return Coupon.findOne({ code: code.toUpperCase(), isDeleted: false, isActive: true });
  },
  async findById(id) {
    return Coupon.findOne({ _id: id, isDeleted: false });
  },
  async create(data) {
    return Coupon.create(data);
  },
  async list({ sellerId, skip, limit }) {
    const filter = { isDeleted: false };
    if (sellerId) filter.sellerId = sellerId;
    else filter.sellerId = null;
    const [items, total] = await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(filter),
    ]);
    return { items, total };
  },
  async listForSeller(sellerId, { skip, limit }) {
    const filter = { isDeleted: false, sellerId };
    const [items, total] = await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(filter),
    ]);
    return { items, total };
  },
  async listAllAdmin({ skip, limit }) {
    const filter = { isDeleted: false };
    const [items, total] = await Promise.all([
      Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments(filter),
    ]);
    return { items, total };
  },
  async incrementUsage(id, session) {
    return Coupon.findByIdAndUpdate(id, { $inc: { timesUsed: 1 } }, { new: true, session });
  },
  async update(id, data) {
    return Coupon.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
  },
  async softDelete(id) {
    return Coupon.findOneAndUpdate({ _id: id }, { isDeleted: true, isActive: false }, { new: true });
  },
};
