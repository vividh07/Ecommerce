import { checkoutService } from '../services/checkoutService.js';

export const checkoutController = {
  createOrder: async (req, res) => {
    const data = await checkoutService.createRazorpayOrder(req.user._id, req.validated);
    res.status(201).json({ success: true, data });
  },
  verify: async (req, res) => {
    const data = await checkoutService.verifyAndFulfill(req.user._id, req.validated);
    res.json({ success: true, data });
  },
  cancel: async (req, res) => {
    const data = await checkoutService.cancelUnpaidOrder(req.user._id, req.validated.orderId);
    res.json({ success: true, data });
  },
};
