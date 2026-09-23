import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/userRepository.js';
import { sellerRepository } from '../repositories/sellerRepository.js';
import { hashToken, compareToken } from '../middleware/auth.js';
import { sendPasswordResetOtp } from '../utils/mailer.js';

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_OTP_ATTEMPTS = 5;
const GENERIC_FORGOT_MSG =
  'If an account exists for that email, we sent a 6-digit reset code.';

export function publicUser(user) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || '',
    phoneCountryCode: user.phoneCountryCode || '+91',
    notificationPrefs: {
      orderUpdates: user.notificationPrefs?.orderUpdates !== false,
      marketing: Boolean(user.notificationPrefs?.marketing),
    },
  };
}

function issueTokens(user) {
  const payload = { sub: user._id.toString(), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return { accessToken, refreshToken };
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
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

    if (!user.passwordHash) {
      throw new ApiError(401, 'This account uses Google sign-in. Continue with Google instead.');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new ApiError(401, 'Invalid credentials');

    const tokens = issueTokens(user);
    const refreshTokenHash = await hashToken(tokens.refreshToken);
    await userRepository.updateRefreshToken(user._id, refreshTokenHash);

    return { user: publicUser(user), ...tokens };
  },

  async googleAuth({ accessToken, role }) {
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!profileRes.ok) {
      throw new ApiError(401, 'Invalid Google token');
    }
    const profile = await profileRes.json();
    const googleId = profile.sub;
    const email = profile.email?.toLowerCase();
    const name = profile.name || profile.given_name || email?.split('@')[0] || 'Google User';

    if (!googleId || !email) {
      throw new ApiError(400, 'Google account did not return email');
    }
    if (profile.email_verified === false) {
      throw new ApiError(400, 'Google email is not verified');
    }

    let user = await userRepository.findByGoogleId(googleId);
    if (!user) {
      user = await userRepository.findByEmail(email);
      if (user) {
        user = await userRepository.linkGoogle(user._id, googleId);
      } else {
        user = await userRepository.create({
          name,
          email,
          passwordHash: null,
          googleId,
          role: role === 'SELLER' ? 'SELLER' : 'CUSTOMER',
        });
      }
    }

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

  async forgotPassword({ email }) {
    const user = await userRepository.findByEmail(email);

    // Same public message always. Google-only accounts can still set a password.
    if (!user || user.isDeleted) {
      return { message: GENERIC_FORGOT_MSG };
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    user.passwordReset = {
      otpHash,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
      attempts: 0,
    };
    await user.save();

    try {
      await sendPasswordResetOtp({ to: user.email, otp, name: user.name });
    } catch (err) {
      console.error('[mail] forgot-password send failed:', err?.message || err);
      console.warn(`[mail] OTP for ${user.email}: ${otp}`);
    }

    return { message: GENERIC_FORGOT_MSG };
  },

  async resetPassword({ email, otp, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.passwordReset?.otpHash) {
      throw new ApiError(400, 'Invalid or expired reset code');
    }

    if (!user.passwordReset.expiresAt || user.passwordReset.expiresAt < new Date()) {
      user.passwordReset = { otpHash: null, expiresAt: null, attempts: 0 };
      await user.save();
      throw new ApiError(400, 'Reset code expired. Request a new one.');
    }

    if ((user.passwordReset.attempts || 0) >= MAX_OTP_ATTEMPTS) {
      user.passwordReset = { otpHash: null, expiresAt: null, attempts: 0 };
      await user.save();
      throw new ApiError(429, 'Too many attempts. Request a new code.');
    }

    const ok = await bcrypt.compare(otp, user.passwordReset.otpHash);
    if (!ok) {
      user.passwordReset.attempts = (user.passwordReset.attempts || 0) + 1;
      await user.save();
      throw new ApiError(400, 'Invalid or expired reset code');
    }

    user.passwordHash = await bcrypt.hash(password, 12);
    user.passwordReset = { otpHash: null, expiresAt: null, attempts: 0 };
    user.refreshTokenHash = null;
    await user.save();

    return { message: 'Password updated. You can sign in now.' };
  },
};
