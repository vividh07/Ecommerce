import { cartService } from '../services/cartService.js';

export const cartController = {
  list: async (req, res) => {
    const carts = await cartService.listCarts(req.user._id);
    res.json({ success: true, data: carts });
  },
  get: async (req, res) => {
    const cart = await cartService.getCart(req.user._id, req.params.cartId);
    res.json({ success: true, data: cart });
  },
  getDefault: async (req, res) => {
    const cart = await cartService.getCart(req.user._id);
    res.json({ success: true, data: cart });
  },
  create: async (req, res) => {
    const cart = await cartService.createCart(req.user._id, req.validated);
    res.status(201).json({ success: true, data: cart });
  },
  updateMeta: async (req, res) => {
    const cart = await cartService.updateCartMeta(req.user._id, req.params.cartId, req.validated);
    res.json({ success: true, data: cart });
  },
  delete: async (req, res) => {
    await cartService.deleteCart(req.user._id, req.params.cartId);
    res.json({ success: true, message: 'Cart deleted' });
  },
  add: async (req, res) => {
    const cartId = req.params.cartId || req.validated.cartId;
    const cart = await cartService.addItem(req.user._id, cartId, req.validated);
    res.json({ success: true, data: cart });
  },
  update: async (req, res) => {
    const cart = await cartService.updateItem(
      req.user._id,
      req.params.cartId,
      req.params.variantId,
      req.validated.quantity
    );
    res.json({ success: true, data: cart });
  },
  remove: async (req, res) => {
    const cart = await cartService.removeItem(
      req.user._id,
      req.params.cartId,
      req.params.variantId
    );
    res.json({ success: true, data: cart });
  },
  duplicate: async (req, res) => {
    const cart = await cartService.duplicateCart(req.user._id, req.params.cartId);
    res.status(201).json({ success: true, data: cart });
  },
  compare: async (req, res) => {
    const data = await cartService.compareCarts(
      req.user._id,
      req.query.left,
      req.query.right
    );
    res.json({ success: true, data });
  },
};
