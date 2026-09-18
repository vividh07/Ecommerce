import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { sellerStatusUpdateSchema } from '../validators/orderSchemas.js';
import { orderController } from '../controllers/orderController.js';

const router = Router();

router.get(
  '/seller/mine',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  asyncHandler(orderController.sellerList)
);
router.patch(
  '/seller/:orderId/status',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  validate(sellerStatusUpdateSchema),
  asyncHandler(orderController.sellerUpdateStatus)
);
router.get(
  '/',
  authenticate,
  requireRole('CUSTOMER', 'SELLER', 'ADMIN'),
  asyncHandler(orderController.list)
);
router.get(
  '/:orderId',
  authenticate,
  requireRole('CUSTOMER', 'SELLER', 'ADMIN'),
  asyncHandler(orderController.get)
);

export default router;
