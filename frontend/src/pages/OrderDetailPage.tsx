import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import type { Order, StatusHistoryEntry } from '../types';
import { OrderTimeline } from '../components/orders/OrderTimeline';
import { Skeleton } from '../components/ui/Skeleton';

export function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/${orderId}`).then((res) => {
      setOrder(res.data.data.order);
      setHistory(res.data.data.history ?? []);
    }).finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !orderId) return;
    const handler = (payload: { orderId: string; status: string }) => {
      if (payload.orderId === orderId) {
        api.get(`/orders/${orderId}`).then((res) => {
          setOrder(res.data.data.order);
          setHistory(res.data.data.history ?? []);
        });
      }
    };
    socket.on('order:updated', handler);
    return () => {
      socket.off('order:updated', handler);
    };
  }, [orderId]);

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!order) return <p className="text-muted">Order not found.</p>;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <Link to="/orders" className="text-sm text-accent hover:underline">← Orders</Link>
        <h1 className="mt-2 font-display text-3xl font-bold">
          Order #{order._id.slice(-8).toUpperCase()}
        </h1>
        <p className="text-muted">{new Date(order.createdAt).toLocaleString()}</p>
        <div className="mt-6 glass rounded-2xl p-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>${order.subtotalAmount.toFixed(2)}</span>
          </div>
          {order.discountAmount && order.discountAmount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
              <span>-${order.discountAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-accent">
            <span>Total</span>
            <span>${order.totalAmount.toFixed(2)}</span>
          </div>
          <p className="pt-2 text-muted">{order.paymentStatus} · {order.status.replace(/_/g, ' ')}</p>
        </div>
        <ul className="mt-6 space-y-2 text-sm">
          {order.items.map((item, i) => (
            <li key={i} className="glass rounded-xl px-4 py-3">
              {item.productName} {item.variantLabel && `(${item.variantLabel})`} × {item.quantity}
            </li>
          ))}
        </ul>
      </div>
      <div className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-semibold">Tracking</h2>
        <p className="mt-1 text-sm text-muted">Live updates via Socket.io</p>
        <div className="mt-6">
          <OrderTimeline current={order.status} history={history} />
        </div>
      </div>
    </div>
  );
}
