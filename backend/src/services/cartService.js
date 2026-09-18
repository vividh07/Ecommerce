import { ApiError } from '../utils/ApiError.js';
import {
  enrichCartItems,
  formatEnrichedCart,
} from './cartEnrichment.js';
import { cartRepository } from '../repositories/cartRepository.js';
import { variantRepository, productRepository } from '../repositories/productRepository.js';
import { sellerRepository } from '../repositories/sellerRepository.js';
import {
  estimateCartDelivery,
  maxEtaDays,
  totalDeliveryFee,
} from '../utils/deliveryEstimate.js';

async function getCartDoc(userId, cartId) {
  const cart = cartId
    ? await cartRepository.findByIdForUser(cartId, userId)
    : await cartRepository.getOrCreateDefault(userId);
  if (!cart) throw new ApiError(404, 'Cart not found');
  return cart;
}

export const cartService = {
  async listCarts(userId) {
    const carts = await cartRepository.listByUser(userId);
    if (!carts.length) {
      await cartRepository.getOrCreateDefault(userId);
      return this.listCarts(userId);
    }
    const summaries = await Promise.all(
      carts.map(async (cart) => {
        const enriched = await enrichCartItems(cart.items);
        return formatEnrichedCart(cart, enriched);
      })
    );
    return summaries;
  },

  async getCart(userId, cartId) {
    const cart = await getCartDoc(userId, cartId);
    const enriched = await enrichCartItems(cart.items);
    return formatEnrichedCart(cart, enriched);
  },

  async createCart(userId, { name, budget }) {
    const existing = await cartRepository.listByUser(userId);
    if (existing.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      throw new ApiError(409, 'A cart with this name already exists');
    }
    const cart = await cartRepository.create({ userId, name, budget });
    const enriched = await enrichCartItems(cart.items);
    return formatEnrichedCart(cart, enriched);
  },

  async updateCartMeta(userId, cartId, { name, budget }) {
    const cart = await getCartDoc(userId, cartId);
    if (name && name !== 'Main') cart.name = name;
    if (budget !== undefined) cart.budget = budget;
    await cartRepository.save(cart);
    return this.getCart(userId, cartId);
  },

  async deleteCart(userId, cartId) {
    const deleted = await cartRepository.softDelete(cartId, userId);
    if (!deleted) throw new ApiError(400, 'Cannot delete this cart');
    return { success: true };
  },

  async addItem(userId, cartId, { variantId, quantity }) {
    const variant = await variantRepository.findById(variantId);
    if (!variant) throw new ApiError(404, 'Variant not found');

    const product = await productRepository.findById(variant.productId);
    if (!product || !product.isActive) throw new ApiError(400, 'Product unavailable');

    const seller = await sellerRepository.findById(product.sellerId);
    if (!seller?.isApproved) throw new ApiError(400, 'Product unavailable');

    if (variant.stock < quantity) throw new ApiError(400, 'Insufficient stock');

    const cart = await getCartDoc(userId, cartId);
    const idx = cart.items.findIndex((i) => i.variantId.toString() === variantId);
    if (idx >= 0) {
      const newQty = cart.items[idx].quantity + quantity;
      if (newQty > variant.stock) throw new ApiError(400, 'Insufficient stock');
      cart.items[idx].quantity = newQty;
    } else {
      cart.items.push({ variantId, quantity });
    }
    await cartRepository.save(cart);
    return this.getCart(userId, cart._id);
  },

  async updateItem(userId, cartId, variantId, quantity) {
    const cart = await getCartDoc(userId, cartId);
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
    return this.getCart(userId, cart._id);
  },

  async removeItem(userId, cartId, variantId) {
    return this.updateItem(userId, cartId, variantId, 0);
  },

  async duplicateCart(userId, cartId) {
    const source = await getCartDoc(userId, cartId);
    const baseName = `Copy of ${source.name}`;
    let name = baseName;
    const existing = await cartRepository.listByUser(userId);
    let n = 2;
    while (existing.some((c) => c.name === name)) {
      name = `${baseName} (${n++})`;
    }
    const copy = await cartRepository.duplicate(source, name);
    return this.getCart(userId, copy._id);
  },

  async compareCarts(userId, cartIdA, cartIdB) {
    const [a, b] = await Promise.all([
      this.getCart(userId, cartIdA),
      this.getCart(userId, cartIdB),
    ]);
    const deliveryA = estimateCartDelivery(a.items);
    const deliveryB = estimateCartDelivery(b.items);
    const totalA = a.subtotal + totalDeliveryFee(deliveryA);
    const totalB = b.subtotal + totalDeliveryFee(deliveryB);
    const etaA = maxEtaDays(deliveryA);
    const etaB = maxEtaDays(deliveryB);

    const variantKeys = new Set([
      ...a.items.map((i) => i.variantId.toString()),
      ...b.items.map((i) => i.variantId.toString()),
    ]);

    const itemDiffs = [...variantKeys].map((vid) => {
      const ia = a.items.find((i) => i.variantId.toString() === vid);
      const ib = b.items.find((i) => i.variantId.toString() === vid);
      return { variantId: vid, left: ia ?? null, right: ib ?? null };
    });

    let cheaper = 'tie';
    if (totalA < totalB) cheaper = 'left';
    else if (totalB < totalA) cheaper = 'right';

    let faster = 'tie';
    if (etaA < etaB) faster = 'left';
    else if (etaB < etaA) faster = 'right';

    return {
      left: { cart: a, delivery: deliveryA, totalWithDelivery: totalA, etaDays: etaA },
      right: { cart: b, delivery: deliveryB, totalWithDelivery: totalB, etaDays: etaB },
      itemDiffs,
      highlights: { cheaper, faster },
    };
  },
};
