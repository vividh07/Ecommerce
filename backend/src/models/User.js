import mongoose from 'mongoose';

const ROLES = ['CUSTOMER', 'SELLER', 'ADMIN'];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: 'CUSTOMER' },
    isDeleted: { type: Boolean, default: false },
    refreshTokenHash: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model('User', userSchema);
export { ROLES };
