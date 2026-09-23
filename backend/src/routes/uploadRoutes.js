import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { productImageUpload } from '../middleware/upload.js';
import { ApiError } from '../utils/ApiError.js';

const router = Router();

router.post(
  '/product-images',
  authenticate,
  requireRole('SELLER', 'ADMIN'),
  (req, res, next) => {
    productImageUpload.array('images', 5)(req, res, (err) => {
      if (err) {
        if (err instanceof ApiError) return next(err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(400, 'Image must be under 10 MB'));
        }
        return next(new ApiError(400, err.message || 'Upload failed'));
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    const files = req.files ?? [];
    if (!files.length) throw new ApiError(400, 'No images uploaded');
    const urls = files.map((f) => `/uploads/products/${f.filename}`);
    res.status(201).json({ success: true, data: { urls } });
  })
);

export default router;
