/** Simple per-seller delivery fee model for comparison UI */
const BASE_FEE = 5.99;
const FREE_SHIPPING_THRESHOLD = 100;

export function estimateSellerDelivery(subtotal) {
  const fee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : BASE_FEE;
  const etaDays = subtotal >= FREE_SHIPPING_THRESHOLD ? 3 : 5;
  return { fee, etaDays, freeShipping: fee === 0 };
}

export function estimateCartDelivery(enrichedItems) {
  const bySeller = new Map();
  for (const item of enrichedItems) {
    const sid = item.product.sellerId.toString();
    const cur = bySeller.get(sid) || {
      sellerId: item.product.sellerId,
      storeName: item.product.storeName,
      subtotal: 0,
    };
    cur.subtotal += item.lineTotal;
    bySeller.set(sid, cur);
  }
  return Array.from(bySeller.values()).map((s) => ({
    ...s,
    ...estimateSellerDelivery(s.subtotal),
  }));
}

export function totalDeliveryFee(sellerEstimates) {
  return sellerEstimates.reduce((sum, s) => sum + s.fee, 0);
}

export function maxEtaDays(sellerEstimates) {
  if (!sellerEstimates.length) return 0;
  return Math.max(...sellerEstimates.map((s) => s.etaDays));
}
