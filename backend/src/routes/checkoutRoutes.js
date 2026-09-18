import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { checkoutCreateSchema } from '../validators/checkoutSchemas.js';
import { checkoutController } from '../controllers/checkoutController.js';

const router = Router();

router.post(
  '/payment-intent',
  authenticate,
  requireRole('CUSTOMER', 'SELLER', 'ADMIN'),
  validate(checkoutCreateSchema),
  asyncHandler(checkoutController.createIntent)
);

export default router;
