import { z } from 'zod';
import { ORDER_STATUSES } from '../models/Order.js';

export const sellerApplySchema = z.object({
  storeName: z.string().min(2).max(120),
  description: z.string().max(2000).optional().default(''),
  supportEmail: z.string().email().optional().or(z.literal('')),
  supportPhone: z.string().max(30).optional().default(''),
  storeSlug: z
    .string()
    .max(80)
    .regex(/^[a-z0-9-]*$/, 'Slug must be lowercase letters, numbers, hyphens')
    .optional()
    .default(''),
  category: z.string().max(80).optional().default(''),
});

export const sellerProfileUpdateSchema = z.object({
  storeName: z.string().min(2).max(120).optional(),
  description: z.string().max(2000).optional(),
  supportEmail: z.string().email().optional().or(z.literal('')),
  supportPhone: z.string().max(30).optional(),
  storeSlug: z
    .string()
    .max(80)
    .regex(/^[a-z0-9-]*$/)
    .optional(),
  category: z.string().max(80).optional(),
  logoUrl: z.string().max(500).optional(),
  coverUrl: z.string().max(500).optional(),
  pickupAddress: z
    .object({
      line1: z.string().max(200).optional(),
      line2: z.string().max(200).optional(),
      city: z.string().max(100).optional(),
      state: z.string().max(100).optional(),
      postalCode: z.string().max(20).optional(),
      country: z.string().max(100).optional(),
    })
    .optional(),
  notifications: z
    .object({
      orderUpdates: z.boolean().optional(),
      lowStock: z.boolean().optional(),
      returns: z.boolean().optional(),
      payouts: z.boolean().optional(),
    })
    .optional(),
  payoutDestination: z
    .object({
      bankName: z.string().max(120).optional(),
      accountLast4: z.string().max(4).optional(),
      holderName: z.string().max(120).optional(),
    })
    .optional(),
  onboardingStep: z.number().int().min(1).max(4).optional(),
  onboardingComplete: z.boolean().optional(),
});

export const sellerOrdersQuerySchema = z.object({
  q: z.string().optional().default(''),
  status: z.enum(ORDER_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const sellerPaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
