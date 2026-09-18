import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { reviewCreateSchema, reviewUpdateSchema } from '../validators/reviewSchemas.js';
import { reviewController } from '../controllers/reviewController.js';

const router = Router();

router.get('/product/:productId', asyncHandler(reviewController.list));
router.post(
  '/product/:productId',
  authenticate,
  requireRole('CUSTOMER', 'SELLER', 'ADMIN'),
  validate(reviewCreateSchema),
  asyncHandler(reviewController.create)
);
router.patch(
  '/:reviewId',
  authenticate,
  requireRole('CUSTOMER', 'SELLER', 'ADMIN'),
  validate(reviewUpdateSchema),
  asyncHandler(reviewController.update)
);
router.delete(
  '/:reviewId',
  authenticate,
  requireRole('CUSTOMER', 'SELLER', 'ADMIN'),
  asyncHandler(reviewController.delete)
);

export default router;
