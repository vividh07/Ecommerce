import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  productCreateSchema,
  productUpdateSchema,
  variantCreateSchema,
  variantUpdateSchema,
} from '../validators/productSchemas.js';
import { productController } from '../controllers/productController.js';

const router = Router();

router.get(
  '/mine',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  asyncHandler(productController.listMine)
);

router.post(
  '/',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  validate(productCreateSchema),
  asyncHandler(productController.create)
);

router.patch(
  '/:productId',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  validate(productUpdateSchema),
  asyncHandler(productController.update)
);

router.delete(
  '/:productId',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  asyncHandler(productController.delete)
);

router.post(
  '/:productId/variants',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  validate(variantCreateSchema),
  asyncHandler(productController.addVariant)
);

router.patch(
  '/:productId/variants/:variantId',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  validate(variantUpdateSchema),
  asyncHandler(productController.updateVariant)
);

router.delete(
  '/:productId/variants/:variantId',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  asyncHandler(productController.deleteVariant)
);

router.get(
  '/admin/all',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(productController.adminList)
);

router.patch(
  '/admin/:productId',
  authenticate,
  requireRole('ADMIN'),
  validate(z.object({ isActive: z.boolean() })),
  asyncHandler(productController.adminToggle)
);

export default router;
