import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  checkoutCreateSchema,
  checkoutVerifySchema,
  checkoutCancelSchema,
} from '../validators/checkoutSchemas.js';
import { checkoutController } from '../controllers/checkoutController.js';

const router = Router();

const roles = ['CUSTOMER', 'SELLER', 'ADMIN'];

router.post(
  '/create-order',
  authenticate,
  requireRole(...roles),
  validate(checkoutCreateSchema),
  asyncHandler(checkoutController.createOrder)
);

/** @deprecated Prefer /create-order — kept for older clients */
router.post(
  '/payment-intent',
  authenticate,
  requireRole(...roles),
  validate(checkoutCreateSchema),
  asyncHandler(checkoutController.createOrder)
);

router.post(
  '/verify',
  authenticate,
  requireRole(...roles),
  validate(checkoutVerifySchema),
  asyncHandler(checkoutController.verify)
);

router.post(
  '/cancel',
  authenticate,
  requireRole(...roles),
  validate(checkoutCancelSchema),
  asyncHandler(checkoutController.cancel)
);

export default router;
