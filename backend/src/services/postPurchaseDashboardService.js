import { Order } from '../models/Order.js';

const MS_DAY = 86400000;

function daysUntil(date) {
  if (!date) return null;
  return Math.ceil((new Date(date).getTime() - Date.now()) / MS_DAY);
}

function urgencyScore(daysLeft) {
  if (daysLeft == null) return 9999;
  return daysLeft;
}

export const postPurchaseDashboardService = {
  async getDashboard(userId, filter = 'all') {
    const orders = await Order.find({
      userId,
      isDeleted: false,
      paymentStatus: 'PAID',
    }).sort({ updatedAt: -1 });

    const deliveries = [];
    const returns = [];
    const warranties = [];
    const replacements = [];

    for (const order of orders) {
      const orderRef = {
        orderId: order._id.toString(),
        orderStatus: order.status,
        placedAt: order.createdAt,
      };

      if (['PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status)) {
        deliveries.push({
          type: 'delivery',
          urgency: urgencyScore(3),
          title: `Order #${order._id.toString().slice(-6).toUpperCase()}`,
          subtitle: order.status.replace(/_/g, ' '),
          daysLeft: null,
          ...orderRef,
        });
      }

      for (const item of order.items) {
        const base = {
          ...orderRef,
          productName: item.productName,
          variantLabel: item.variantLabel,
          quantity: item.quantity,
        };

        if (item.returnDeadline) {
          const left = daysUntil(item.returnDeadline);
          if (left != null && left >= 0) {
            returns.push({
              type: 'return',
              urgency: urgencyScore(left),
              title: item.productName,
              subtitle: left <= 3 ? `${left} day${left === 1 ? '' : 's'} left to return` : `Return by ${new Date(item.returnDeadline).toLocaleDateString()}`,
              daysLeft: left,
              returnDeadline: item.returnDeadline,
              ...base,
            });
          }
        }

        if (item.warrantyExpiry) {
          const left = daysUntil(item.warrantyExpiry);
          if (left != null && left >= 0 && left <= 90) {
            warranties.push({
              type: 'warranty',
              urgency: urgencyScore(left),
              title: item.productName,
              subtitle: `Warranty ends ${new Date(item.warrantyExpiry).toLocaleDateString()}`,
              daysLeft: left,
              warrantyExpiry: item.warrantyExpiry,
              ...base,
            });
          }
        }

        if (item.replacementEligible && item.deliveredAt) {
          const left = daysUntil(item.returnDeadline);
          if (left != null && left > 0 && left <= 14) {
            replacements.push({
              type: 'replacement',
              urgency: urgencyScore(left),
              title: item.productName,
              subtitle: 'Eligible for replacement while return window is open',
              daysLeft: left,
              ...base,
            });
          }
        }
      }
    }

    let items = [...deliveries, ...returns, ...warranties, ...replacements];
    if (filter === 'deliveries') items = deliveries;
    else if (filter === 'returns') items = returns;
    else if (filter === 'warranties') items = warranties;
    else if (filter === 'replacements') items = replacements;

    items.sort((a, b) => a.urgency - b.urgency);

    return {
      summary: {
        activeDeliveries: deliveries.length,
        returnWindows: returns.length,
        warrantyAlerts: warranties.length,
        replacementReminders: replacements.length,
      },
      items,
    };
  },
};
