import { z } from 'zod';

export const addressSchema = z.object({
  label: z.string().min(1).max(40).optional().default('Home'),
  fullName: z.string().min(2).max(100),
  phone: z.string().min(8).max(20),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional().default(''),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().min(4).max(20),
  country: z.string().min(2).max(2).optional().default('IN'),
  isDefault: z.boolean().optional().default(false),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .default('')
    .refine((v) => !v || v.replace(/\s/g, '').length >= 8, 'Enter a valid phone number'),
  phoneCountryCode: z.string().trim().min(2).max(6).optional().default('+91'),
  notificationPrefs: z
    .object({
      orderUpdates: z.boolean().optional(),
      marketing: z.boolean().optional(),
    })
    .optional(),
});

export const addressUpdateSchema = z.object({
  label: z.string().min(1).max(40).optional(),
  fullName: z.string().min(2).max(100).optional(),
  phone: z.string().min(8).max(20).optional(),
  line1: z.string().min(3).max(200).optional(),
  line2: z.string().max(200).optional(),
  city: z.string().min(2).max(100).optional(),
  state: z.string().min(2).max(100).optional(),
  postalCode: z.string().min(4).max(20).optional(),
  country: z.string().min(2).max(2).optional(),
  isDefault: z.boolean().optional(),
});
