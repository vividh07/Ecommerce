import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    storeName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    isApproved: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

sellerSchema.index({ userId: 1 });
sellerSchema.index({ isApproved: 1, isDeleted: 1 });

export const Seller = mongoose.model('Seller', sellerSchema);
