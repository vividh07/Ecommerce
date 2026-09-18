import { z } from 'zod';

export const couponCreateSchema = z.object({
  code: z.string().min(3).max(32),
  type: z.enum(['PERCENTAGE', 'FIXED']),
  value: z.coerce.number().min(0),
  minOrderValue: z.coerce.number().min(0).optional().default(0),
  expiryDate: z.coerce.date(),
  usageLimit: z.coerce.number().int().min(1).optional().nullable(),
});

export const couponPreviewSchema = z.object({
  code: z.string().min(1),
  subtotal: z.coerce.number().min(0),
  sellerIds: z.array(z.string()).default([]),
});

export const couponToggleSchema = z.object({
  isActive: z.boolean(),
});
