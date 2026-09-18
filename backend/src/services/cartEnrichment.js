import { variantRepository, productRepository } from '../repositories/productRepository.js';
import { sellerRepository } from '../repositories/sellerRepository.js';

export async function enrichCartItems(items) {
  const enriched = [];
  let subtotal = 0;

  for (const item of items) {
    const variant = await variantRepository.findById(item.variantId);
    if (!variant) continue;

    const product = await productRepository.findById(variant.productId);
    if (!product || product.isDeleted || !product.isActive) continue;

    const seller = await sellerRepository.findById(product.sellerId);
    if (!seller?.isApproved || seller.isDeleted) continue;

    const attrs =
      variant.attributes instanceof Map
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

export function formatEnrichedCart(cart, enriched) {
  const budget = cart.budget ?? null;
  const budgetUsedPercent =
    budget && budget > 0 ? Math.min(100, Math.round((enriched.subtotal / budget) * 100)) : null;
  return {
    id: cart._id.toString(),
    name: cart.name,
    budget,
    budgetUsedPercent,
    overBudget: budget != null && enriched.subtotal > budget,
    items: enriched.items,
    subtotal: enriched.subtotal,
  };
}
