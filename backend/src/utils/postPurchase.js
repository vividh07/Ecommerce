import { variantRepository } from '../repositories/productRepository.js';

const DEFAULT_RETURN_DAYS = 30;

export async function applyItemPostPurchaseFields(order, deliveredAt = new Date()) {
  const windowDays = order.returnWindowDays ?? DEFAULT_RETURN_DAYS;
  order.deliveredAt = deliveredAt;

  for (const item of order.items) {
    item.deliveredAt = deliveredAt;
    const returnDeadline = new Date(deliveredAt);
    returnDeadline.setDate(returnDeadline.getDate() + windowDays);
    item.returnDeadline = returnDeadline;

    const variant = await variantRepository.findById(item.variantId);
    const months = variant?.warrantyMonths ?? 12;
    const warrantyExpiry = new Date(deliveredAt);
    warrantyExpiry.setMonth(warrantyExpiry.getMonth() + months);
    item.warrantyExpiry = warrantyExpiry;
    item.replacementEligible = variant?.replacementEligible ?? true;
  }

  order.markModified('items');
  return order;
}
