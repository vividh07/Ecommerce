import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/userRepository.js';
import { sellerRepository } from '../repositories/sellerRepository.js';
import { hashToken, compareToken } from '../middleware/auth.js';

function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function issueTokens(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
}

export const authService = {
  async register({ name, email, password, role }) {
    const existing = await userRepository.findByEmail(email);
    if (existing) throw new ApiError(409, 'Email already registered');

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await userRepository.create({
      name,
      email,
      passwordHash,
      role: role === 'SELLER' ? 'SELLER' : 'CUSTOMER',
    });

    const tokens = issueTokens(user);
    const refreshTokenHash = await hashToken(tokens.refreshToken);
    await userRepository.updateRefreshToken(user._id, refreshTokenHash);

    return { user: publicUser(user), ...tokens };
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw new ApiError(401, 'Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, 'Invalid credentials');

    const tokens = issueTokens(user);
    const refreshTokenHash = await hashToken(tokens.refreshToken);
    await userRepository.updateRefreshToken(user._id, refreshTokenHash);

    return { user: publicUser(user), ...tokens };
  },

  async refresh({ refreshToken }) {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, 'Invalid refresh token');
    }

    const user = await userRepository.findById(payload.sub);
    if (!user) throw new ApiError(401, 'Invalid refresh token');

    const matches = await compareToken(refreshToken, user.refreshTokenHash);
    if (!matches) throw new ApiError(401, 'Invalid refresh token');

    const tokens = issueTokens(user);
    const refreshTokenHash = await hashToken(tokens.refreshToken);
    await userRepository.updateRefreshToken(user._id, refreshTokenHash);

    return { user: publicUser(user), ...tokens };
  },

  async logout(userId) {
    await userRepository.updateRefreshToken(userId, null);
  },

  async me(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    const seller = await sellerRepository.findByUserId(userId);
    return {
      user: publicUser(user),
      seller: seller
        ? {
            id: seller._id.toString(),
            storeName: seller.storeName,
            isApproved: seller.isApproved,
          }
        : null,
    };
  },
};
