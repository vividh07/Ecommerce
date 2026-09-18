import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { shoppingRoomController } from '../controllers/shoppingRoomController.js';

const router = Router();

router.use(authenticate, requireRole('CUSTOMER', 'SELLER', 'ADMIN'));

router.post('/', asyncHandler(shoppingRoomController.create));
router.get('/:roomCode', asyncHandler(shoppingRoomController.get));
router.post('/:roomCode/join', asyncHandler(shoppingRoomController.join));
router.post(
  '/:roomCode/add-to-cart',
  validate(
    z.object({
      productId: z.string().min(1),
      cartId: z.string().optional(),
    })
  ),
  asyncHandler(shoppingRoomController.addToCart)
);
router.post('/:roomCode/close', asyncHandler(shoppingRoomController.close));

export default router;
