import { reviewService } from '../services/reviewService.js';

export const reviewController = {
  list: async (req, res) => {
    const result = await reviewService.list(req.params.productId, req.query);
    res.json({ success: true, ...result });
  },
  create: async (req, res) => {
    const review = await reviewService.create(req.user._id, req.params.productId, req.validated);
    res.status(201).json({ success: true, data: review });
  },
  update: async (req, res) => {
    const review = await reviewService.update(req.user._id, req.params.reviewId, req.validated);
    res.json({ success: true, data: review });
  },
  delete: async (req, res) => {
    await reviewService.delete(req.user._id, req.params.reviewId);
    res.json({ success: true, message: 'Review deleted' });
  },
};
