import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { getSocket } from '../lib/socket';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { Stepper } from '../components/ui/Stepper';
import { ShipmentTimeline } from '../components/orders/OrderTimeline';
import type { Order, StatusHistoryEntry } from '../types';
import { Skeleton } from '../components/ui/Skeleton';

const trackSteps = [
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'packed', label: 'Packed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
];

function trackIndex(status: string) {
  if (status === 'DELIVERED') return 3;
  if (status === 'OUT_FOR_DELIVERY' || status === 'SHIPPED') return 2;
  if (status === 'CONFIRMED') return 1;
  return 0;
}

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
    const handler = (p: { orderId: string }) => {
      if (p.orderId === orderId) {
        api.get(`/orders/${orderId}`).then((res) => {
          setOrder(res.data.data.order);
          setHistory(res.data.data.history ?? []);
        });
      }
    };
    socket.on('order:updated', handler);
    return () => { socket.off('order:updated', handler); };
  }, [orderId]);

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!order) return <p className="text-muted">Order not found.</p>;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'ACCOUNT', to: '/orders' }, { label: 'ORDERS', to: '/orders' }, { label: `#${order._id.slice(-6)}` }]} />
      <h1 className="page-title mt-4">On its way.</h1>
      <p className="mt-2 text-muted">Your order #{order._id.slice(-6).toUpperCase()} is on the move.</p>

      <div className="mt-10 card p-6">
        <p className="text-sm text-muted">Estimated arrival</p>
        <p className="text-2xl font-semibold">{new Date(Date.now() + 5 * 86400000).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        <div className="mt-6">
          <Stepper steps={trackSteps} current={trackIndex(order.status)} variant="tracking" />
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-semibold">Shipment history</h2>
          <ShipmentTimeline history={history} current={order.status} />
        </div>
        <div className="card p-6">
          <h2 className="font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-4">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between gap-4 text-sm border-b border-border pb-4 last:border-0">
                <div>
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-muted">{item.variantLabel}</p>
                </div>
                <div className="text-right">
                  <p>${item.lineTotal.toFixed(2)}</p>
                  <p className="text-muted">× {item.quantity}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-2xl font-bold">${order.totalAmount.toFixed(2)}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" className="btn-outline text-sm">Download invoice</button>
            <button type="button" className="btn-outline text-sm">Contact support</button>
          </div>
        </div>
      </div>
      <Link to="/orders" className="mt-8 inline-block text-sm text-accent">← Back to orders</Link>
    </div>
  );
}
