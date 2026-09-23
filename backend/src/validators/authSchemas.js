import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  role: z.enum(['CUSTOMER', 'SELLER']).optional().default('CUSTOMER'),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const googleAuthSchema = z.object({
  accessToken: z.string().min(1),
  role: z.enum(['CUSTOMER', 'SELLER']).optional().default('CUSTOMER'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  password: z.string().min(8).max(128),
});
