import { ApiError } from '../utils/ApiError.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { reviewRepository, productRepository } from '../repositories/productRepository.js';
import { Order } from '../models/Order.js';

async function assertVerifiedPurchase(userId, productId) {
  const order = await Order.findOne({
    userId,
    isDeleted: false,
    paymentStatus: 'PAID',
    'items.productId': productId,
  });
  if (!order) {
    throw new ApiError(403, 'You can only review products you have purchased');
  }
}

export const reviewService = {
  async list(productId, query) {
    const product = await productRepository.findById(productId);
    if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
    const { page, limit, skip } = parsePagination(query);
    const { items, total } = await reviewRepository.listByProduct(productId, { skip, limit });
    const stats = await reviewRepository.statsForProduct(productId);
    return { items, stats, meta: paginationMeta({ page, limit, total }) };
  },

  async create(userId, productId, data) {
    const product = await productRepository.findById(productId);
    if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
    await assertVerifiedPurchase(userId, productId);

    const existing = await reviewRepository.findByProductAndUser(productId, userId);
    if (existing) throw new ApiError(409, 'You already reviewed this product');

    return reviewRepository.create({ ...data, productId, userId });
  },

  async update(userId, reviewId, data) {
    const review = await reviewRepository.update(reviewId, userId, data);
    if (!review) throw new ApiError(404, 'Review not found');
    return review;
  },

  async delete(userId, reviewId) {
    const review = await reviewRepository.delete(reviewId, userId);
    if (!review) throw new ApiError(404, 'Review not found');
    return review;
  },
};
