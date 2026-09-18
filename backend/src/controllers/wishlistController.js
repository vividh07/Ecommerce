import { wishlistService } from '../services/wishlistService.js';

export const wishlistController = {
  get: async (req, res) => {
    const products = await wishlistService.get(req.user._id);
    res.json({ success: true, data: products });
  },
  add: async (req, res) => {
    const products = await wishlistService.add(req.user._id, req.params.productId);
    res.json({ success: true, data: products });
  },
  remove: async (req, res) => {
    const products = await wishlistService.remove(req.user._id, req.params.productId);
    res.json({ success: true, data: products });
  },
  moveToCart: async (req, res) => {
    const cart = await wishlistService.moveToCart(
      req.user._id,
      req.params.productId,
      req.validated.cartId
    );
    res.json({ success: true, data: cart });
  },
};
