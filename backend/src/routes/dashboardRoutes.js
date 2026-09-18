import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { dashboardController } from '../controllers/dashboardController.js';

const router = Router();

router.get(
  '/post-purchase',
  authenticate,
  requireRole('CUSTOMER', 'SELLER', 'ADMIN'),
  asyncHandler(dashboardController.postPurchase)
);

export default router;
