import { checkoutService } from '../services/checkoutService.js';

export const checkoutController = {
  createIntent: async (req, res) => {
    const data = await checkoutService.createPaymentIntent(req.user._id, req.validated);
    res.status(201).json({ success: true, data });
  },
};
