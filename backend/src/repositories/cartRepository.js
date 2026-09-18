import { Cart } from '../models/Cart.js';

export const cartRepository = {
  async listByUser(userId) {
    return Cart.find({ userId, isDeleted: false }).sort({ updatedAt: -1 });
  },

  async findByIdForUser(cartId, userId) {
    return Cart.findOne({ _id: cartId, userId, isDeleted: false });
  },

  async getOrCreateDefault(userId) {
    let cart = await Cart.findOne({ userId, name: 'Main', isDeleted: false });
    if (!cart) {
      cart = await Cart.create({ userId, name: 'Main', items: [], budget: null });
    }
    return cart;
  },

  async create({ userId, name, budget, items = [] }) {
    return Cart.create({ userId, name, budget: budget ?? null, items });
  },

  async save(cart) {
    return cart.save();
  },

  async softDelete(cartId, userId) {
    const cart = await Cart.findOne({ _id: cartId, userId, isDeleted: false });
    if (!cart) return null;
    if (cart.name === 'Main') return null;
    cart.isDeleted = true;
    return cart.save();
  },

  async clear(cartId) {
    return Cart.findByIdAndUpdate(cartId, { items: [] }, { new: true });
  },

  async duplicate(sourceCart, newName) {
    return Cart.create({
      userId: sourceCart.userId,
      name: newName,
      budget: sourceCart.budget,
      items: sourceCart.items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    });
  },
};
