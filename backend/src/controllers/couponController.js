import { couponService } from '../services/couponService.js';

export const couponController = {
  preview: async (req, res) => {
    const result = await couponService.preview(
      req.validated.code,
      req.validated.subtotal,
      req.validated.sellerIds
    );
    res.json({
      success: true,
      data: {
        code: result.coupon.code,
        discountAmount: result.discountAmount,
        total: result.total,
        type: result.coupon.type,
        value: result.coupon.value,
      },
    });
  },
  createAdmin: async (req, res) => {
    const coupon = await couponService.createAdmin(req.validated);
    res.status(201).json({ success: true, data: coupon });
  },
  createSeller: async (req, res) => {
    const coupon = await couponService.createForSeller(req.user._id, req.validated);
    res.status(201).json({ success: true, data: coupon });
  },
  listAdmin: async (req, res) => {
    const result = await couponService.listAdmin(req.query);
    res.json({ success: true, ...result });
  },
  listSeller: async (req, res) => {
    const result = await couponService.listSeller(req.user._id, req.query);
    res.json({ success: true, ...result });
  },
  toggle: async (req, res) => {
    const coupon = await couponService.toggleActive(req.params.couponId, req.validated.isActive);
    res.json({ success: true, data: coupon });
  },
  remove: async (req, res) => {
    await couponService.remove(req.params.couponId);
    res.json({ success: true, message: 'Coupon removed' });
  },
};
