import { ApiError } from '../utils/ApiError.js';
import { sellerRepository } from '../repositories/sellerRepository.js';
import { userRepository } from '../repositories/userRepository.js';

export const sellerService = {
  async apply(userId, data) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
      throw new ApiError(403, 'Register as a seller to apply');
    }

    const existing = await sellerRepository.findByUserId(userId);
    if (existing) throw new ApiError(409, 'Seller profile already exists');

    return sellerRepository.create({ userId, ...data, isApproved: false });
  },

  async getProfile(userId) {
    const seller = await sellerRepository.findByUserId(userId);
    if (!seller) throw new ApiError(404, 'Seller profile not found');
    return seller;
  },
};
