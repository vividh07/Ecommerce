import { ORDER_STATUSES } from '../models/Order.js';

const FLOW = ['PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];

export function statusIndex(status) {
  if (status === 'CANCELLED' || status === 'RETURNED') return -1;
  const idx = FLOW.indexOf(status);
  return idx >= 0 ? idx : 0;
}

export function aggregateOrderStatus(sellerStatuses, fallback = 'PLACED') {
  if (!sellerStatuses?.length) return fallback;
  if (sellerStatuses.some((s) => s === 'CANCELLED')) return 'CANCELLED';
  if (sellerStatuses.some((s) => s === 'RETURNED')) return 'RETURNED';
  const indices = sellerStatuses.map((s) => statusIndex(s));
  const minIdx = Math.min(...indices);
  return FLOW[minIdx] ?? fallback;
}

export function canAdvanceStatus(current, next) {
  if (next === 'CANCELLED' || next === 'RETURNED') return true;
  return statusIndex(next) >= statusIndex(current);
}

export { FLOW as ORDER_STATUS_FLOW, ORDER_STATUSES };
