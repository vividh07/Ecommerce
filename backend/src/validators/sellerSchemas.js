import { z } from 'zod';

export const sellerApplySchema = z.object({
  storeName: z.string().min(2).max(120),
  description: z.string().max(2000).optional().default(''),
});
