import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { sellerApplySchema } from '../validators/sellerSchemas.js';
import { sellerController } from '../controllers/sellerController.js';

const router = Router();

router.post(
  '/apply',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  validate(sellerApplySchema),
  asyncHandler(sellerController.apply)
);
router.get(
  '/me',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  asyncHandler(sellerController.profile)
);

export default router;
