import { ApiError } from '../utils/ApiError.js';
import { wishlistRepository } from '../repositories/wishlistRepository.js';
import { productRepository } from '../repositories/productRepository.js';
import { cartService } from './cartService.js';

export const wishlistService = {
  async get(userId) {
    const list = await wishlistRepository.getOrCreate(userId);
    const products = await Promise.all(
      list.productIds.map(async (id) => {
        const p = await productRepository.findById(id);
        if (!p || p.isDeleted || !p.isActive) return null;
        return p;
      })
    );
    return products.filter(Boolean);
  },

  async add(userId, productId) {
    const product = await productRepository.findById(productId);
    if (!product || !product.isActive) throw new ApiError(404, 'Product not found');
    const list = await wishlistRepository.getOrCreate(userId);
    const exists = list.productIds.some((id) => id.toString() === productId);
    if (!exists) list.productIds.push(productId);
    await wishlistRepository.save(list);
    return this.get(userId);
  },

  async remove(userId, productId) {
    const list = await wishlistRepository.getOrCreate(userId);
    list.productIds = list.productIds.filter((id) => id.toString() !== productId);
    await wishlistRepository.save(list);
    return this.get(userId);
  },

  async moveToCart(userId, productId, cartId) {
    const { variantRepository } = await import('../repositories/productRepository.js');
    const variants = await variantRepository.listByProduct(productId);
    const inStock = variants.find((v) => v.stock > 0);
    if (!inStock) throw new ApiError(400, 'No in-stock variant available');
    await this.remove(userId, productId);
    return cartService.addItem(userId, cartId, { variantId: inStock._id.toString(), quantity: 1 });
  },
};
