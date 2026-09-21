import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  adminOrdersQuerySchema,
  adminFulfillmentSchema,
  adminCustomersQuerySchema,
  adminInventoryQuerySchema,
  adminInventoryStockSchema,
  adminReturnsQuerySchema,
  adminSettingsUpdateSchema,
} from '../validators/adminSchemas.js';
import { adminController } from '../controllers/adminController.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/sellers/pending', asyncHandler(adminController.pendingSellers));
router.post('/sellers/:sellerId/approve', asyncHandler(adminController.approveSeller));
router.post('/sellers/:sellerId/reject', asyncHandler(adminController.rejectSeller));

router.get('/overview', asyncHandler(adminController.overview));

router.get(
  '/orders',
  validate(adminOrdersQuerySchema, 'query'),
  asyncHandler(adminController.listOrders)
);
router.get('/orders/:orderId', asyncHandler(adminController.getOrder));
router.patch(
  '/orders/:orderId/fulfillment',
  validate(adminFulfillmentSchema),
  asyncHandler(adminController.updateFulfillment)
);

router.get(
  '/customers',
  validate(adminCustomersQuerySchema, 'query'),
  asyncHandler(adminController.listCustomers)
);

router.get(
  '/inventory',
  validate(adminInventoryQuerySchema, 'query'),
  asyncHandler(adminController.listInventory)
);
router.patch(
  '/inventory/:variantId',
  validate(adminInventoryStockSchema),
  asyncHandler(adminController.updateInventory)
);

router.get(
  '/returns',
  validate(adminReturnsQuerySchema, 'query'),
  asyncHandler(adminController.listReturns)
);

router.get('/reports', asyncHandler(adminController.reports));

router.get('/settings', asyncHandler(adminController.getSettings));
router.patch(
  '/settings',
  validate(adminSettingsUpdateSchema),
  asyncHandler(adminController.updateSettings)
);

export default router;
