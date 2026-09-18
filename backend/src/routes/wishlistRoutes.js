import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { wishlistMoveSchema } from '../validators/wishlistSchemas.js';
import { wishlistController } from '../controllers/wishlistController.js';

const router = Router();

router.use(authenticate, requireRole('CUSTOMER', 'SELLER', 'ADMIN'));

router.get('/', asyncHandler(wishlistController.get));
router.post('/:productId', asyncHandler(wishlistController.add));
router.delete('/:productId', asyncHandler(wishlistController.remove));
router.post(
  '/:productId/move-to-cart',
  validate(wishlistMoveSchema),
  asyncHandler(wishlistController.moveToCart)
);

export default router;
