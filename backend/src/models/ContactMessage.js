import mongoose from 'mongoose';

const TOPICS = [
  'Order question',
  'Delivery',
  'Returns',
  'Product question',
  'Account',
  'Other',
];

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    topic: { type: String, required: true, enum: TOPICS },
    orderNumber: { type: String, default: '', trim: true, maxlength: 64 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    status: { type: String, enum: ['NEW', 'READ', 'CLOSED'], default: 'NEW' },
  },
  { timestamps: true }
);

contactMessageSchema.index({ email: 1, createdAt: -1 });

export const CONTACT_TOPICS = TOPICS;
export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
