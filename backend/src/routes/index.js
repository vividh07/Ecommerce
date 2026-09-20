import { Router } from 'express';
import authRoutes from './authRoutes.js';
import catalogRoutes from './catalogRoutes.js';
import productRoutes from './productRoutes.js';
import cartRoutes from './cartRoutes.js';
import wishlistRoutes from './wishlistRoutes.js';
import couponRoutes from './couponRoutes.js';
import checkoutRoutes from './checkoutRoutes.js';
import orderRoutes from './orderRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import sellerRoutes from './sellerRoutes.js';
import adminRoutes from './adminRoutes.js';
import shoppingRoomRoutes from './shoppingRoomRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import siteRoutes from './siteRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/catalog', catalogRoutes);
router.use('/products', productRoutes);
router.use('/', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/coupons', couponRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/sellers', sellerRoutes);
router.use('/admin', adminRoutes);
router.use('/shopping-rooms', shoppingRoomRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/site', siteRoutes);

export default router;
