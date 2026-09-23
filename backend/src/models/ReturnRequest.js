import mongoose from 'mongoose';

const RETURN_STATUSES = [
  'REQUESTED',
  'UNDER_REVIEW',
  'APPROVED',
  'IN_TRANSIT',
  'REFUNDED',
  'REJECTED',
  'RETURNED',
];

const returnRequestSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    variantLabel: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
    reason: { type: String, required: true, trim: true },
    notes: { type: String, default: '', maxlength: 500 },
    action: { type: String, enum: ['return', 'exchange'], default: 'return' },
    status: { type: String, enum: RETURN_STATUSES, default: 'REQUESTED' },
    refundAmount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

returnRequestSchema.index({ sellerId: 1, createdAt: -1 });
returnRequestSchema.index({ orderId: 1, variantId: 1 });
returnRequestSchema.index({ userId: 1, createdAt: -1 });

export const ReturnRequest = mongoose.model('ReturnRequest', returnRequestSchema);
export { RETURN_STATUSES };
