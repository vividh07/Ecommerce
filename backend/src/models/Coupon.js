import mongoose from 'mongoose';

const COUPON_TYPES = ['PERCENTAGE', 'FIXED'];

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: COUPON_TYPES, required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    expiryDate: { type: Date, required: true },
    usageLimit: { type: Number, default: null, min: 1 },
    timesUsed: { type: Number, default: 0, min: 0 },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', default: null },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

couponSchema.index({ sellerId: 1, isActive: 1 });

export const Coupon = mongoose.model('Coupon', couponSchema);
export { COUPON_TYPES };
