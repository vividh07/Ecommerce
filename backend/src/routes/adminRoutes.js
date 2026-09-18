import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { adminController } from '../controllers/adminController.js';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/sellers/pending', asyncHandler(adminController.pendingSellers));
router.post('/sellers/:sellerId/approve', asyncHandler(adminController.approveSeller));
router.post('/sellers/:sellerId/reject', asyncHandler(adminController.rejectSeller));

export default router;
