import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    storeName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    supportEmail: { type: String, default: '', trim: true },
    supportPhone: { type: String, default: '', trim: true },
    storeSlug: { type: String, default: '', trim: true },
    category: { type: String, default: '', trim: true },
    logoUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    pickupAddress: {
      line1: { type: String, default: '' },
      line2: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      postalCode: { type: String, default: '' },
      country: { type: String, default: 'India' },
    },
    notifications: {
      orderUpdates: { type: Boolean, default: true },
      lowStock: { type: Boolean, default: true },
      returns: { type: Boolean, default: true },
      payouts: { type: Boolean, default: true },
    },
    payoutDestination: {
      bankName: { type: String, default: '' },
      accountLast4: { type: String, default: '' },
      holderName: { type: String, default: '' },
    },
    onboardingStep: { type: Number, default: 1, min: 1, max: 4 },
    onboardingComplete: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

sellerSchema.index({ isApproved: 1, isDeleted: 1 });
sellerSchema.index({ storeSlug: 1 });

export const Seller = mongoose.model('Seller', sellerSchema);
