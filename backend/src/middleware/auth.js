import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { userRepository } from '../repositories/userRepository.js';

export async function authenticate(req, _res, next) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required');
    }
    const token = header.slice(7);
    const payload = verifyAccessToken(token);
    const user = await userRepository.findById(payload.sub);
    if (!user || user.isDeleted) {
      throw new ApiError(401, 'Invalid or expired session');
    }
    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(new ApiError(401, 'Invalid or expired token'));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    next();
  };
}

export async function hashToken(token) {
  return bcrypt.hash(token, 10);
}

export async function compareToken(token, hash) {
  if (!hash) return false;
  return bcrypt.compare(token, hash);
}
