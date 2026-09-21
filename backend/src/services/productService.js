import { ApiError } from '../utils/ApiError.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { productRepository, variantRepository } from '../repositories/productRepository.js';
import { sellerRepository } from '../repositories/sellerRepository.js';
import { categoryRepository } from '../repositories/categoryRepository.js';

async function getApprovedSellerForUser(userId) {
  const seller = await sellerRepository.findByUserId(userId);
  if (!seller) throw new ApiError(403, 'Seller profile required');
  if (!seller.isApproved) throw new ApiError(403, 'Seller account pending approval');
  return seller;
}

export const productService = {
  async createProduct(userId, data) {
    const seller = await getApprovedSellerForUser(userId);
    const category = await categoryRepository.findById(data.categoryId);
    if (!category) throw new ApiError(400, 'Invalid category');
    return productRepository.create({ ...data, sellerId: seller._id });
  },

  async updateProduct(userId, productId, data) {
    const seller = await getApprovedSellerForUser(userId);
    if (data.categoryId) {
      const category = await categoryRepository.findById(data.categoryId);
      if (!category) throw new ApiError(400, 'Invalid category');
    }
    const product = await productRepository.update(productId, seller._id, data);
    if (!product) throw new ApiError(404, 'Product not found');
    return product;
  },

  async deleteProduct(userId, productId) {
    const seller = await getApprovedSellerForUser(userId);
    const product = await productRepository.softDelete(productId, seller._id);
    if (!product) throw new ApiError(404, 'Product not found');
    return product;
  },

  async listSellerProducts(userId, query) {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller) throw new ApiError(403, 'Seller profile required');
    const { page, limit, skip } = parsePagination(query);
    const { items, total } = await productRepository.listBySeller(seller._id, { skip, limit });
    return { items, meta: paginationMeta({ page, limit, total }) };
  },

  async addVariant(userId, productId, data) {
    const seller = await getApprovedSellerForUser(userId);
    const product = await productRepository.findById(productId);
    if (!product || product.sellerId.toString() !== seller._id.toString()) {
      throw new ApiError(404, 'Product not found');
    }
    return variantRepository.create({ ...data, productId });
  },

  async updateVariant(userId, productId, variantId, data) {
    const seller = await getApprovedSellerForUser(userId);
    const product = await productRepository.findById(productId);
    if (!product || product.sellerId.toString() !== seller._id.toString()) {
      throw new ApiError(404, 'Product not found');
    }
    const variant = await variantRepository.update(variantId, productId, data);
    if (!variant) throw new ApiError(404, 'Variant not found');
    return variant;
  },

  async deleteVariant(userId, productId, variantId) {
    const seller = await getApprovedSellerForUser(userId);
    const product = await productRepository.findById(productId);
    if (!product || product.sellerId.toString() !== seller._id.toString()) {
      throw new ApiError(404, 'Product not found');
    }
    const variant = await variantRepository.delete(variantId, productId);
    if (!variant) throw new ApiError(404, 'Variant not found');
    return variant;
  },

  async adminListProducts(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { isDeleted: false };
    const { Product } = await import('../models/Product.js');
    const [items, total] = await Promise.all([
      Product.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).populate('sellerId', 'storeName'),
      Product.countDocuments(filter),
    ]);
    return { items, meta: paginationMeta({ page, limit, total }) };
  },

  async adminToggleProduct(productId, { isActive }) {
    const product = await productRepository.adminUpdate(productId, { isActive });
    if (!product) throw new ApiError(404, 'Product not found');
    return product;
  },

  async adminGetProduct(productId) {
    const product = await productRepository.findById(productId);
    if (!product) throw new ApiError(404, 'Product not found');
    const variants = await variantRepository.listByProduct(productId);
    const { Product } = await import('../models/Product.js');
    const populated = await Product.findById(product._id)
      .populate('sellerId', 'storeName')
      .populate('categoryId', 'name');
    return { ...(populated?.toObject?.() ?? product.toObject()), variants };
  },
};
