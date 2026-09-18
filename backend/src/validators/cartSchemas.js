import { z } from 'zod';

export const cartItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(99),
});

export const cartUpdateSchema = z.object({
  quantity: z.coerce.number().int().min(0).max(99),
});
