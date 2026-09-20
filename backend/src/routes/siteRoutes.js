import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { contactSchema, newsletterSchema, trackOrderSchema } from '../validators/siteSchemas.js';
import { siteController } from '../controllers/siteController.js';

const router = Router();

router.post('/newsletter', validate(newsletterSchema), asyncHandler(siteController.subscribe));
router.post('/contact', validate(contactSchema), asyncHandler(siteController.contact));
router.post('/track-order', validate(trackOrderSchema), asyncHandler(siteController.trackOrder));

export default router;
