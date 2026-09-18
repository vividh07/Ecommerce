import { ApiError } from '../utils/ApiError.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { sellerRepository } from '../repositories/sellerRepository.js';

export const adminService = {
  async listPendingSellers(query) {
    const { page, limit, skip } = parsePagination(query);
    const { items, total } = await sellerRepository.listPending({ skip, limit });
    return { items, meta: paginationMeta({ page, limit, total }) };
  },

  async approveSeller(sellerId) {
    const seller = await sellerRepository.approve(sellerId);
    if (!seller) throw new ApiError(404, 'Seller not found');
    return seller;
  },

  async rejectSeller(sellerId) {
    const seller = await sellerRepository.softDelete(sellerId);
    if (!seller) throw new ApiError(404, 'Seller not found');
    return seller;
  },
};
