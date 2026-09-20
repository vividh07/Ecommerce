import { z } from 'zod';

export const newsletterSchema = z.object({
  email: z.string().email().max(200),
  source: z.string().max(64).optional(),
});

export const contactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(200),
  topic: z.enum([
    'Order question',
    'Delivery',
    'Returns',
    'Product question',
    'Account',
    'Other',
  ]),
  orderNumber: z.string().max(64).optional().default(''),
  message: z.string().min(10).max(1000),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(3).max(64),
  email: z.string().email().max(200),
});
