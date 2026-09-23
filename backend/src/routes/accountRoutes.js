import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addressSchema, addressUpdateSchema, profileUpdateSchema } from '../validators/accountSchemas.js';
import { accountController } from '../controllers/accountController.js';

const router = Router();

router.use(authenticate, requireRole('CUSTOMER', 'SELLER', 'ADMIN'));

router.patch('/profile', validate(profileUpdateSchema), asyncHandler(accountController.updateProfile));

router.get('/addresses', asyncHandler(accountController.listAddresses));
router.post('/addresses', validate(addressSchema), asyncHandler(accountController.addAddress));
router.patch(
  '/addresses/:addressId',
  validate(addressUpdateSchema),
  asyncHandler(accountController.updateAddress)
);
router.delete('/addresses/:addressId', asyncHandler(accountController.deleteAddress));

router.get('/notifications', asyncHandler(accountController.listNotifications));
router.patch(
  '/notifications/:notificationId/read',
  asyncHandler(accountController.markNotificationRead)
);
router.post('/notifications/read-all', asyncHandler(accountController.markAllNotificationsRead));

export default router;
