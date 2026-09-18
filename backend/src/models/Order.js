import mongoose from 'mongoose';

const ORDER_STATUSES = ['PLACED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

const orderItemSchema = new mongoose.Schema(
  {
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
    productName: { type: String, required: true },
    variantLabel: { type: String, default: '' },
  },
  { _id: false }
);

const sellerBreakdownSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    storeName: { type: String, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    itemCount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sellerBreakdown: { type: [sellerBreakdownSchema], default: [] },
    items: { type: [orderItemSchema], default: [] },
    shippingAddress: {
      fullName: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'US' },
      phone: { type: String, default: '' },
    },
    status: { type: String, enum: ORDER_STATUSES, default: 'PLACED' },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: 'PENDING' },
    stripePaymentIntentId: { type: String, default: null },
    totalAmount: { type: Number, required: true, min: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ stripePaymentIntentId: 1 });
orderSchema.index({ 'items.sellerId': 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
export { ORDER_STATUSES, PAYMENT_STATUSES };
