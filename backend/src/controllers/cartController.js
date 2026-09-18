import { cartService } from '../services/cartService.js';

export const cartController = {
  get: async (req, res) => {
    const cart = await cartService.getCart(req.user._id);
    res.json({ success: true, data: cart });
  },
  add: async (req, res) => {
    const cart = await cartService.addItem(req.user._id, req.validated);
    res.json({ success: true, data: cart });
  },
  update: async (req, res) => {
    const cart = await cartService.updateItem(req.user._id, req.params.variantId, req.validated.quantity);
    res.json({ success: true, data: cart });
  },
  remove: async (req, res) => {
    const cart = await cartService.removeItem(req.user._id, req.params.variantId);
    res.json({ success: true, data: cart });
  },
};
