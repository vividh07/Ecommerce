import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  couponCreateSchema,
  couponPreviewSchema,
  couponToggleSchema,
} from '../validators/couponSchemas.js';
import { couponController } from '../controllers/couponController.js';

const router = Router();

router.post('/preview', validate(couponPreviewSchema), asyncHandler(couponController.preview));

router.post(
  '/admin',
  authenticate,
  requireRole('ADMIN'),
  validate(couponCreateSchema),
  asyncHandler(couponController.createAdmin)
);
router.get(
  '/admin',
  authenticate,
  requireRole('ADMIN'),
  asyncHandler(couponController.listAdmin)
);

router.post(
  '/seller',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  validate(couponCreateSchema),
  asyncHandler(couponController.createSeller)
);
router.get(
  '/seller',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  asyncHandler(couponController.listSeller)
);

router.patch(
  '/:couponId',
  authenticate,
  requireRole('ADMIN', 'SELLER'),
  validate(couponToggleSchema),
  asyncHandler(couponController.toggle)
);
router.delete(
  '/:couponId',
  authenticate,
  requireRole('ADMIN', 'SELLER'),
  asyncHandler(couponController.remove)
);

export default router;
