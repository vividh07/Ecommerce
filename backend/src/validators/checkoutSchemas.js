import { z } from 'zod';

export const shippingAddressSchema = z.object({
  fullName: z.string().min(2).max(120),
  line1: z.string().min(3).max(200),
  line2: z.string().max(200).optional().default(''),
  city: z.string().min(2).max(100),
  state: z.string().min(2).max(100),
  postalCode: z.string().min(3).max(20),
  country: z.string().min(2).max(2).optional().default('IN'),
  phone: z.string().max(30).optional().default(''),
});

export const checkoutCreateSchema = z.object({
  shippingAddress: shippingAddressSchema,
  cartId: z.string().optional(),
  couponCode: z.string().trim().optional(),
});

export const checkoutVerifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export const checkoutCancelSchema = z.object({
  orderId: z.string().min(1),
});
