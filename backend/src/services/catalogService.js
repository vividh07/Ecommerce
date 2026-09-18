import { ApiError } from '../utils/ApiError.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import {
  productRepository,
  variantRepository,
  reviewRepository,
} from '../repositories/productRepository.js';
import { categoryRepository } from '../repositories/categoryRepository.js';
import { sellerRepository } from '../repositories/sellerRepository.js';

export const catalogService = {
  async listCategories() {
    return categoryRepository.listAll();
  },

  async browse(query) {
    const { page, limit, skip } = parsePagination(query);
    const { items, total } = await productRepository.searchCatalog({
      q: query.q,
      categoryId: query.categoryId,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      minRating: query.minRating,
      sort: query.sort,
      skip,
      limit,
    });
    return { items, meta: paginationMeta({ page, limit, total }) };
  },

  async getProductDetail(productId) {
    const product = await productRepository.findById(productId);
    if (!product || !product.isActive) {
      throw new ApiError(404, 'Product not found');
    }
    const seller = await sellerRepository.findById(product.sellerId);
    if (!seller?.isApproved) {
      throw new ApiError(404, 'Product not found');
    }
    const variants = await variantRepository.listByProduct(productId);
    const reviewStats = await reviewRepository.statsForProduct(productId);
    const category = await categoryRepository.findById(product.categoryId);
    return {
      product,
      variants,
      reviewStats,
      seller: { storeName: seller.storeName, id: seller._id },
      category,
    };
  },
};
