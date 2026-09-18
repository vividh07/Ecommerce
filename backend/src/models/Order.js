import mongoose from 'mongoose';

const ORDER_STATUSES = [
  'PLACED',
  'CONFIRMED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
];
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
    deliveredAt: { type: Date, default: null },
    returnDeadline: { type: Date, default: null },
    warrantyExpiry: { type: Date, default: null },
    replacementEligible: { type: Boolean, default: false },
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

const sellerFulfillmentSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    storeName: { type: String, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: 'CONFIRMED' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cartId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart', default: null },
    sellerBreakdown: { type: [sellerBreakdownSchema], default: [] },
    sellerFulfillment: { type: [sellerFulfillmentSchema], default: [] },
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
    subtotalAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    couponCode: { type: String, default: null },
    couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon', default: null },
    totalAmount: { type: Number, required: true, min: 0 },
    deliveredAt: { type: Date, default: null },
    returnWindowDays: { type: Number, default: 30 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ stripePaymentIntentId: 1 });
orderSchema.index({ 'items.sellerId': 1, createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
export { ORDER_STATUSES, PAYMENT_STATUSES };
