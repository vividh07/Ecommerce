import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  sellerApplySchema,
  sellerProfileUpdateSchema,
  sellerOrdersQuerySchema,
  sellerPaginationQuerySchema,
} from '../validators/sellerSchemas.js';
import { sellerController } from '../controllers/sellerController.js';

const router = Router();

router.use(authenticate, requireRole('SELLER', 'ADMIN'));

router.post('/apply', validate(sellerApplySchema), asyncHandler(sellerController.apply));
router.get('/me', asyncHandler(sellerController.profile));
router.patch(
  '/me',
  validate(sellerProfileUpdateSchema),
  asyncHandler(sellerController.updateProfile)
);

router.get('/overview', asyncHandler(sellerController.overview));
router.get(
  '/orders',
  validate(sellerOrdersQuerySchema, 'query'),
  asyncHandler(sellerController.listOrders)
);
router.get('/orders/:orderId', asyncHandler(sellerController.getOrder));
router.get(
  '/returns',
  validate(sellerPaginationQuerySchema, 'query'),
  asyncHandler(sellerController.listReturns)
);
router.get('/payouts', asyncHandler(sellerController.payouts));
router.get('/product-stats', asyncHandler(sellerController.productStats));

export default router;
