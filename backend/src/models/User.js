import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home', trim: true, maxlength: 40 },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, default: '', trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, default: 'IN', trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, default: '', trim: true },
    href: { type: String, default: '', trim: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ROLES = ['CUSTOMER', 'SELLER', 'ADMIN'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    googleId: { type: String },
    role: { type: String, enum: ROLES, default: 'CUSTOMER' },
    isDeleted: { type: Boolean, default: false },
    refreshTokenHash: { type: String, default: null },
    phone: { type: String, default: '', trim: true },
    phoneCountryCode: { type: String, default: '+91', trim: true },
    notificationPrefs: {
      orderUpdates: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
    },
    addresses: { type: [addressSchema], default: [] },
    notifications: { type: [notificationSchema], default: [] },
    passwordReset: {
      otpHash: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });
userSchema.index(
  { googleId: 1 },
  { unique: true, partialFilterExpression: { googleId: { $type: 'string' } } }
);

export const User = mongoose.model('User', userSchema);
export { ROLES };
