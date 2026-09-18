import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { cartItemSchema, cartUpdateSchema } from '../validators/cartSchemas.js';
import { cartController } from '../controllers/cartController.js';

const router = Router();

router.use(authenticate, requireRole('CUSTOMER', 'SELLER', 'ADMIN'));

router.get('/', asyncHandler(cartController.get));
router.post('/items', validate(cartItemSchema), asyncHandler(cartController.add));
router.patch(
  '/items/:variantId',
  validate(cartUpdateSchema),
  asyncHandler(cartController.update)
);
router.delete('/items/:variantId', asyncHandler(cartController.remove));

export default router;
