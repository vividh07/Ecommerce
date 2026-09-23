import { z } from 'zod';

export const sellerStatusUpdateSchema = z.object({
  status: z.enum([
    'CONFIRMED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
  ]),
  note: z.string().max(500).optional().default(''),
});

export const returnRequestSchema = z.object({
  variantId: z.string().min(1),
  reason: z.string().min(2).max(200),
  notes: z.string().max(500).optional().default(''),
  action: z.enum(['return', 'exchange']).optional().default('return'),
});
