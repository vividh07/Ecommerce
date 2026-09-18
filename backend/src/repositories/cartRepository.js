import { Cart } from '../models/Cart.js';

export const cartRepository = {
  async findByUserId(userId) {
    return Cart.findOne({ userId });
  },
  async getOrCreate(userId) {
    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
    }
    return cart;
  },
  async save(cart) {
    return cart.save();
  },
  async clear(userId) {
    return Cart.findOneAndUpdate({ userId }, { items: [] }, { new: true });
  },
};
