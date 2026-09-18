import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sku: { type: String, required: true, trim: true },
    warrantyMonths: { type: Number, default: 12, min: 0 },
    replacementEligible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productVariantSchema.index({ productId: 1 });
productVariantSchema.index({ sku: 1 }, { unique: true });

export const ProductVariant = mongoose.model('ProductVariant', productVariantSchema);
