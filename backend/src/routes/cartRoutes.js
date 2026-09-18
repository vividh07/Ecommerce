import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import {
  cartItemSchema,
  cartUpdateSchema,
  cartCreateSchema,
  cartMetaUpdateSchema,
  cartCompareQuerySchema,
} from '../validators/cartSchemas.js';
import { cartController } from '../controllers/cartController.js';
import { cartRepository } from '../repositories/cartRepository.js';

const router = Router();

const auth = [authenticate, requireRole('CUSTOMER', 'SELLER', 'ADMIN')];

async function withDefaultCartId(req, _res, next) {
  const cart = await cartRepository.getOrCreateDefault(req.user._id);
  req.params.cartId = cart._id.toString();
  next();
}

router.get(
  '/carts/compare',
  ...auth,
  validate(cartCompareQuerySchema, 'query'),
  asyncHandler(cartController.compare)
);

router.get('/carts', ...auth, asyncHandler(cartController.list));
router.post('/carts', ...auth, validate(cartCreateSchema), asyncHandler(cartController.create));
router.get('/carts/:cartId', ...auth, asyncHandler(cartController.get));
router.patch('/carts/:cartId', ...auth, validate(cartMetaUpdateSchema), asyncHandler(cartController.updateMeta));
router.delete('/carts/:cartId', ...auth, asyncHandler(cartController.delete));
router.post('/carts/:cartId/duplicate', ...auth, asyncHandler(cartController.duplicate));
router.post('/carts/:cartId/items', ...auth, validate(cartItemSchema), asyncHandler(cartController.add));
router.patch(
  '/carts/:cartId/items/:variantId',
  ...auth,
  validate(cartUpdateSchema),
  asyncHandler(cartController.update)
);
router.delete('/carts/:cartId/items/:variantId', ...auth, asyncHandler(cartController.remove));

router.get('/cart', ...auth, asyncHandler(cartController.getDefault));
router.post('/cart/items', ...auth, validate(cartItemSchema), asyncHandler(cartController.add));
router.patch(
  '/cart/items/:variantId',
  ...auth,
  withDefaultCartId,
  validate(cartUpdateSchema),
  asyncHandler(cartController.update)
);
router.delete(
  '/cart/items/:variantId',
  ...auth,
  withDefaultCartId,
  asyncHandler(cartController.remove)
);

export default router;
