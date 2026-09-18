import { z } from 'zod';

export const cartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
  cartId: z.string().optional(),
});

export const cartUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(99),
});

export const cartCreateSchema = z.object({
  name: z.string().min(1).max(80),
  budget: z.coerce.number().min(0).optional().nullable(),
});

export const cartMetaUpdateSchema = z.object({
  name: z.string().min(1).max(80).optional(),
  budget: z.coerce.number().min(0).optional().nullable(),
});

export const cartCompareQuerySchema = z.object({
  left: z.string().min(1),
  right: z.string().min(1),
});
