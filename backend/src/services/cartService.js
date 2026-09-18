import { ApiError } from '../utils/ApiError.js';
import { cartRepository } from '../repositories/cartRepository.js';
import { variantRepository, productRepository } from '../repositories/productRepository.js';
import { sellerRepository } from '../repositories/sellerRepository.js';

async function enrichCartItems(items) {
  const enriched = [];
  let subtotal = 0;

  for (const item of items) {
    const variant = await variantRepository.findById(item.variantId);
    if (!variant) continue;

    const product = await productRepository.findById(variant.productId);
    if (!product || product.isDeleted || !product.isActive) continue;

    const seller = await sellerRepository.findById(product.sellerId);
    if (!seller?.isApproved || seller.isDeleted) continue;

    const attrs = variant.attributes instanceof Map
      ? Object.fromEntries(variant.attributes)
      : variant.attributes || {};

    const lineTotal = variant.price * item.quantity;
    subtotal += lineTotal;

    enriched.push({
      variantId: variant._id,
      quantity: item.quantity,
      unitPrice: variant.price,
      lineTotal,
      stock: variant.stock,
      sku: variant.sku,
      attributes: attrs,
      product: {
        id: product._id,
        name: product.name,
        image: product.images?.[0] ?? null,
        sellerId: seller._id,
        storeName: seller.storeName,
      },
    });
  }

  return { items: enriched, subtotal };
}

export const cartService = {
  async getCart(userId) {
    const cart = await cartRepository.getOrCreate(userId);
    const enriched = await enrichCartItems(cart.items);
    return { id: cart._id, ...enriched };
  },

  async addItem(userId, { variantId, quantity }) {
    const variant = await variantRepository.findById(variantId);
    if (!variant) throw new ApiError(404, 'Variant not found');

    const product = await productRepository.findById(variant.productId);
    if (!product || !product.isActive) throw new ApiError(400, 'Product unavailable');

    const seller = await sellerRepository.findById(product.sellerId);
    if (!seller?.isApproved) throw new ApiError(400, 'Product unavailable');

    if (variant.stock < quantity) throw new ApiError(400, 'Insufficient stock');

    const cart = await cartRepository.getOrCreate(userId);
    const idx = cart.items.findIndex((i) => i.variantId.toString() === variantId);
    if (idx >= 0) {
      const newQty = cart.items[idx].quantity + quantity;
      if (newQty > variant.stock) throw new ApiError(400, 'Insufficient stock');
      cart.items[idx].quantity = newQty;
    } else {
      cart.items.push({ variantId, quantity });
    }
    await cartRepository.save(cart);
    return this.getCart(userId);
  },

  async updateItem(userId, variantId, quantity) {
    const cart = await cartRepository.getOrCreate(userId);
    const idx = cart.items.findIndex((i) => i.variantId.toString() === variantId);
    if (idx < 0) throw new ApiError(404, 'Item not in cart');

    if (quantity === 0) {
      cart.items.splice(idx, 1);
    } else {
      const variant = await variantRepository.findById(variantId);
      if (!variant) throw new ApiError(404, 'Variant not found');
      if (quantity > variant.stock) throw new ApiError(400, 'Insufficient stock');
      cart.items[idx].quantity = quantity;
    }
    await cartRepository.save(cart);
    return this.getCart(userId);
  },

  async removeItem(userId, variantId) {
    return this.updateItem(userId, variantId, 0);
  },
};
