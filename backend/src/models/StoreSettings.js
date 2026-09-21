import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema(
  {
    storeName: { type: String, default: 'Nexus Market', trim: true },
    supportEmail: { type: String, default: 'support@demo.shop', trim: true, lowercase: true },
    currency: { type: String, default: 'INR', trim: true },
    timezone: { type: String, default: 'Asia/Kolkata', trim: true },
    storeUrl: { type: String, default: '', trim: true },
    businessName: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    country: { type: String, default: 'IN', trim: true },
    testMode: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);
