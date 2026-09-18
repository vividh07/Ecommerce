import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    name: { type: String, required: true, trim: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, default: '' },
    basePrice: { type: Number, required: true, min: 0 },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ sellerId: 1, isDeleted: 1 });
productSchema.index({ categoryId: 1, isActive: 1, isDeleted: 1 });
productSchema.index({ basePrice: 1 });

export const Product = mongoose.model('Product', productSchema);
