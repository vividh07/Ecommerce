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
