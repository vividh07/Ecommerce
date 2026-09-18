import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    variantId: { type: mongoose.Schema.Types.ObjectId, ref: 'ProductVariant', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true, default: 'Main' },
    budget: { type: Number, default: null, min: 0 },
    items: { type: [cartItemSchema], default: [] },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

cartSchema.index({ userId: 1, isDeleted: 1 });
cartSchema.index({ userId: 1, name: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

export const Cart = mongoose.model('Cart', cartSchema);
