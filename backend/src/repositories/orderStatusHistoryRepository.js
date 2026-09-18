import { OrderStatusHistory } from '../models/OrderStatusHistory.js';

export const orderStatusHistoryRepository = {
  async add(entry, session) {
    const doc = new OrderStatusHistory(entry);
    return doc.save({ session });
  },
  async listByOrder(orderId) {
    return OrderStatusHistory.find({ orderId }).sort({ timestamp: 1 });
  },
};
