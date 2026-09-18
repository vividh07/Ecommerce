import { z } from 'zod';

export const wishlistMoveSchema = z.object({
  cartId: z.string().optional(),
});
