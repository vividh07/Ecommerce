import { z } from 'zod';

export const productCreateSchema = z.object({
  name: z.string().min(2).max(200),
  categoryId: z.string().min(1),
  description: z.string().max(5000).optional().default(''),
  basePrice: z.coerce.number().min(0),
  images: z.array(z.string().url()).max(10).optional().default([]),
  isActive: z.boolean().optional().default(true),
});

export const productUpdateSchema = productCreateSchema.partial();

export const variantCreateSchema = z.object({
  attributes: z.record(z.string()).default({}),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  sku: z.string().min(1).max(64),
});

export const variantUpdateSchema = variantCreateSchema.partial();

export const catalogQuerySchema = z.object({
  q: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'rating']).optional(),
  page: z.coerce.number().optional(),
  limit: z.coerce.number().optional(),
});
