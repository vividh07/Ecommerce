import { z } from 'zod';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../models/Order.js';

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

export const adminOrdersQuerySchema = z.object({
  q: z.string().optional().default(''),
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
  fulfillment: z.enum(ORDER_STATUSES).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const adminOrderIdParamsSchema = z.object({
  orderId: objectId,
});

export const adminFulfillmentSchema = z.object({
  status: z.enum(ORDER_STATUSES),
  note: z.string().max(500).optional().default(''),
  sellerId: objectId.optional(),
});

export const adminCustomersQuerySchema = z.object({
  q: z.string().optional().default(''),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const adminInventoryQuerySchema = z.object({
  q: z.string().optional().default(''),
  status: z.enum(['In', 'Low', 'Out']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const adminInventoryStockSchema = z.object({
  stock: z.coerce.number().int().min(0),
});

export const adminVariantIdParamsSchema = z.object({
  variantId: objectId,
});

export const adminReturnsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const adminSettingsUpdateSchema = z
  .object({
    storeName: z.string().min(1).max(120).optional(),
    supportEmail: z.string().email().optional(),
    currency: z.string().min(3).max(8).optional(),
    timezone: z.string().min(1).max(64).optional(),
    storeUrl: z.string().max(300).optional(),
    businessName: z.string().max(160).optional(),
    address: z.string().max(500).optional(),
    country: z.string().min(2).max(56).optional(),
    testMode: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'At least one field required' });
