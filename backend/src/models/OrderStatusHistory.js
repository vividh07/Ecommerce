import mongoose from 'mongoose';
import { ORDER_STATUSES } from './Order.js';

const orderStatusHistorySchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    status: { type: String, enum: ORDER_STATUSES, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', default: null },
  },
  { timestamps: true }
);

orderStatusHistorySchema.index({ orderId: 1, timestamp: 1 });

export const OrderStatusHistory = mongoose.model('OrderStatusHistory', orderStatusHistorySchema);
