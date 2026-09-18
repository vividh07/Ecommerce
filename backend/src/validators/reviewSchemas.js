import { z } from 'zod';

export const reviewCreateSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional().default(''),
});

export const reviewUpdateSchema = reviewCreateSchema.partial();
