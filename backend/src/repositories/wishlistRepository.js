import { Wishlist } from '../models/Wishlist.js';

export const wishlistRepository = {
  async getOrCreate(userId) {
    let list = await Wishlist.findOne({ userId });
    if (!list) list = await Wishlist.create({ userId, productIds: [] });
    return list;
  },
  async save(doc) {
    return doc.save();
  },
};
