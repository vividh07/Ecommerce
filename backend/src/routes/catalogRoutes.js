import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { catalogQuerySchema } from '../validators/productSchemas.js';
import { catalogController } from '../controllers/catalogController.js';

const router = Router();

router.get('/categories', asyncHandler(catalogController.categories));
router.get(
  '/products',
  validate(catalogQuerySchema, 'query'),
  asyncHandler(catalogController.browse)
);
router.get('/products/:productId', asyncHandler(catalogController.productDetail));

export default router;
