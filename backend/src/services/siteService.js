import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { NewsletterSubscriber } from '../models/NewsletterSubscriber.js';
import { ContactMessage } from '../models/ContactMessage.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { OrderStatusHistory } from '../models/OrderStatusHistory.js';

function normalizeOrderRef(raw) {
  return String(raw || '')
    .trim()
    .replace(/^#/, '')
    .toLowerCase();
}

export const siteService = {
  async subscribeNewsletter({ email, source }) {
    const existing = await NewsletterSubscriber.findOne({ email: email.toLowerCase() });
    if (existing) {
      if (!existing.isActive) {
        existing.isActive = true;
        existing.source = source || existing.source;
        await existing.save();
      }
      return { subscribed: true, alreadySubscribed: true };
    }
    await NewsletterSubscriber.create({
      email: email.toLowerCase(),
      source: source || 'site',
    });
    return { subscribed: true, alreadySubscribed: false };
  },

  async submitContact(payload) {
    const doc = await ContactMessage.create({
      name: payload.name,
      email: payload.email.toLowerCase(),
      topic: payload.topic,
      orderNumber: payload.orderNumber || '',
      message: payload.message,
    });
    return {
      id: doc._id,
      createdAt: doc.createdAt,
    };
  },

  async trackOrder({ orderNumber, email }) {
    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: { $ne: true } });
    if (!user) throw new ApiError(404, 'No order found for that email and order number');

    const ref = normalizeOrderRef(orderNumber);
    let order = null;

    if (mongoose.Types.ObjectId.isValid(ref) && String(new mongoose.Types.ObjectId(ref)) === ref) {
      order = await Order.findOne({ _id: ref, userId: user._id, isDeleted: false });
    }

    if (!order) {
      const candidates = await Order.find({ userId: user._id, isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(50);
      order =
        candidates.find((o) => {
          const id = o._id.toString().toLowerCase();
          return id === ref || id.endsWith(ref) || id.slice(-6) === ref.slice(-6);
        }) || null;
    }

    if (!order) throw new ApiError(404, 'No order found for that email and order number');

    const history = await OrderStatusHistory.find({ orderId: order._id }).sort({ timestamp: 1 });

    return {
      orderId: order._id,
      orderNumber: `#${order._id.toString().slice(-6).toUpperCase()}`,
      status: order.status,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      items: order.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        lineTotal: i.lineTotal,
      })),
      history: history.map((h) => ({
        status: h.status,
        timestamp: h.timestamp,
        note: h.note,
      })),
    };
  },
};
