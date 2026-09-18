import { ApiError } from '../utils/ApiError.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { couponRepository } from '../repositories/couponRepository.js';
import { sellerRepository } from '../repositories/sellerRepository.js';

export function calculateDiscount(coupon, subtotal, sellerIdsInCart = []) {
  if (subtotal < coupon.minOrderValue) {
    throw new ApiError(400, `Minimum order value is $${coupon.minOrderValue}`);
  }
  if (coupon.expiryDate < new Date()) {
    throw new ApiError(400, 'Coupon has expired');
  }
  if (coupon.usageLimit != null && coupon.timesUsed >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit reached');
  }
  if (coupon.sellerId) {
    const sid = coupon.sellerId.toString();
    const applicable = sellerIdsInCart.some((id) => id.toString() === sid);
    if (!applicable) {
      throw new ApiError(400, 'Coupon does not apply to items in this cart');
    }
  }

  let discount = 0;
  if (coupon.type === 'PERCENTAGE') {
    discount = Math.round(subtotal * (coupon.value / 100) * 100) / 100;
  } else {
    discount = Math.min(coupon.value, subtotal);
  }
  return discount;
}

export const couponService = {
  async validateForCheckout(code, subtotal, sellerIdsInCart) {
    const coupon = await couponRepository.findByCode(code);
    if (!coupon) throw new ApiError(404, 'Invalid coupon code');
    const discountAmount = calculateDiscount(coupon, subtotal, sellerIdsInCart);
    const total = Math.max(0, subtotal - discountAmount);
    return { coupon, discountAmount, total };
  },

  async preview(code, subtotal, sellerIdsInCart) {
    return this.validateForCheckout(code, subtotal, sellerIdsInCart);
  },

  async createAdmin(data) {
    return couponRepository.create({ ...data, code: data.code.toUpperCase(), sellerId: null });
  },

  async createForSeller(userId, data) {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller?.isApproved) throw new ApiError(403, 'Approved seller required');
    return couponRepository.create({
      ...data,
      code: data.code.toUpperCase(),
      sellerId: seller._id,
    });
  },

  async listAdmin(query) {
    const { page, limit, skip } = parsePagination(query);
    const { items, total } = await couponRepository.listAllAdmin({ skip, limit });
    return { items, meta: paginationMeta({ page, limit, total }) };
  },

  async listSeller(userId, query) {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller) throw new ApiError(403, 'Seller profile required');
    const { page, limit, skip } = parsePagination(query);
    const { items, total } = await couponRepository.listForSeller(seller._id, { skip, limit });
    return { items, meta: paginationMeta({ page, limit, total }) };
  },

  async toggleActive(id, isActive) {
    const coupon = await couponRepository.update(id, { isActive });
    if (!coupon) throw new ApiError(404, 'Coupon not found');
    return coupon;
  },

  async remove(id) {
    const coupon = await couponRepository.softDelete(id);
    if (!coupon) throw new ApiError(404, 'Coupon not found');
    return coupon;
  },
};
