import { Seller } from '../models/Seller.js';

export const sellerRepository = {
  async create(data) {
    return Seller.create(data);
  },
  async findByUserId(userId) {
    return Seller.findOne({ userId, isDeleted: false });
  },
  async findById(id) {
    return Seller.findOne({ _id: id, isDeleted: false });
  },
  async updateByUserId(userId, data) {
    return Seller.findOneAndUpdate({ userId, isDeleted: false }, data, {
      new: true,
      runValidators: true,
    });
  },
  async listPending({ skip, limit }) {
    const filter = { isApproved: false, isDeleted: false };
    const [items, total] = await Promise.all([
      Seller.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name email'),
      Seller.countDocuments(filter),
    ]);
    return { items, total };
  },
  async approve(id) {
    return Seller.findOneAndUpdate({ _id: id, isDeleted: false }, { isApproved: true }, { new: true });
  },
  async softDelete(id) {
    return Seller.findByIdAndUpdate(id, { isDeleted: true, isApproved: false }, { new: true });
  },
};
