import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { formatINR } from '../lib/money';
import { getSocket } from '../lib/socket';
import { AccountSidebar } from '../components/layout/AccountSidebar';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { Stepper } from '../components/ui/Stepper';
import { ShipmentTimeline } from '../components/orders/OrderTimeline';
import { IconShippingBox } from '../components/icons/Icons';
import type { Order, StatusHistoryEntry } from '../types';
import { Skeleton } from '../components/ui/Skeleton';

const trackStepsBase = [
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

function stepDetails(createdAt: string, status: string) {
  const start = new Date(createdAt).getTime();
  const day = (offset: number, hour = 10) => {
    const d = new Date(start + offset * 86400000);
    d.setHours(hour, offset === 0 ? 14 : 20, 0, 0);
    return d.toLocaleString(undefined, {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  const idx = trackIndex(status);
  return [
    idx >= 0 ? day(0, 14) : '—',
    idx >= 1 ? day(1, 9) : '—',
    idx >= 2 ? day(2, 16) : 'Pending',
    idx >= 3 ? day(4, 11) : 'Pending',
  ];
}

export function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [history, setHistory] = useState<StatusHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    api
      .get(`/orders/${orderId}`)
      .then((res) => {
        setOrder(res.data.data.order);
        setHistory(res.data.data.history ?? []);
      })
      .finally(() => setLoading(false));
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
    return () => {
      socket.off('order:updated', handler);
    };
  }, [orderId]);

  if (loading) return <Skeleton className="h-64 w-full" />;
  if (!order) return <p className="text-muted">Order not found.</p>;

  const eta = new Date(order.createdAt);
  eta.setDate(eta.getDate() + 4);
  const details = stepDetails(order.createdAt, order.status);
  const trackSteps = trackStepsBase.map((s, i) => ({ ...s, detail: details[i] }));
  const shortId = order._id.slice(-4).toUpperCase();

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
      <AccountSidebar />
      <div className="min-w-0 flex-1">
        <Breadcrumbs
          items={[
            { label: 'ACCOUNT', to: '/orders' },
            { label: 'ORDERS', to: '/orders' },
            { label: `#${shortId}` },
          ]}
        />

        <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
          <div>
            <h1 className="page-title">On its way.</h1>
            <p className="mt-3 text-sm text-muted">
              Your order #{shortId} is on the move.
            </p>
          </div>
          <div className="hidden text-right text-muted sm:block">
            <IconShippingBox className="ml-auto h-20 w-20 text-white/80" />
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.28em]">Good things ahead.</p>
          </div>
        </div>

        <div className="panel mt-10 p-6 md:p-8">
          <p className="text-sm text-muted">Estimated arrival</p>
          <p className="mt-1 text-2xl font-semibold md:text-3xl">
            {eta.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <div className="mt-8">
            <Stepper steps={trackSteps} current={trackIndex(order.status)} variant="tracking" />
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="panel p-6">
            <h2 className="font-semibold">Shipment history</h2>
            <ShipmentTimeline history={history} current={order.status} />
          </div>

          <div className="panel p-6">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-semibold">Order summary</h2>
              <span className="text-xs text-muted">#{shortId}</span>
            </div>
            <ul className="mt-5 space-y-4">
              {order.items.map((item, i) => (
                <li key={i} className="flex gap-3 border-b border-border pb-4 last:border-0">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] border border-border bg-panel-2 text-[10px] uppercase text-muted">
                    {item.productName.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{item.productName}</p>
                    <p className="text-xs text-muted">{item.variantLabel || 'Standard'}</p>
                    <p className="mt-1 text-xs text-muted">Qty: {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-medium">{formatINR(item.lineTotal)}</p>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
              <span className="text-sm text-muted">Total</span>
              <span className="text-2xl font-bold">{formatINR(order.totalAmount)}</span>
            </div>
            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <button type="button" className="btn-outline w-full text-sm">
                Download invoice
              </button>
              <button type="button" className="btn-outline w-full text-sm">
                Contact support
              </button>
            </div>
          </div>
        </div>

        <Link to="/orders" className="mt-8 inline-block text-sm text-[#d4ff3f] hover:underline">
          ← Back to orders
        </Link>
      </div>
    </div>
  );
}
