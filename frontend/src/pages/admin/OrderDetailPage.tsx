import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import { DemoBadge, DotStatus, Thumb, formatShortDate, initials } from '../../components/admin/adminUi';
import { IconPackage } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';

type OrderDetail = {
  _id: string;
  orderNumber?: string;
  createdAt: string;
  totalAmount: number;
  subtotalAmount: number;
  discountAmount?: number;
  paymentStatus: string;
  status: string;
  items: Array<{
    productName: string;
    variantLabel: string;
    quantity: number;
    lineTotal: number;
    unitPrice?: number;
  }>;
  shippingAddress: {
    fullName: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  customer?: { name?: string; email?: string } | null;
};

type HistoryEntry = { status: string; timestamp: string; note?: string };

export function OrderDetailPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      setOrder(res.data.data.order);
      setHistory(res.data.data.history ?? []);
    } catch {
      toast.error('Order not found');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [orderId]);

  async function markPacked() {
    if (!order) return;
    setSaving(true);
    try {
      const next =
        order.status === 'PLACED' || order.status === 'CONFIRMED'
          ? 'SHIPPED'
          : order.status === 'SHIPPED'
            ? 'OUT_FOR_DELIVERY'
            : 'DELIVERED';
      await api.patch(`/admin/orders/${order._id}/fulfillment`, { status: next, note: note || undefined });
      toast.success('Fulfilment updated');
      load();
    } catch {
      toast.error('Could not update fulfilment');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!order) return <p className="text-muted">Order not found.</p>;

  const number = order.orderNumber ?? `#${order._id.slice(-6).toUpperCase()}`;
  const unfulfilled = ['PLACED', 'CONFIRMED'].includes(order.status);

  return (
    <div>
      <p className="text-sm text-muted">
        <Link to="/admin/orders" className="hover:text-text">
          Orders
        </Link>
        {' / '}
        {number}
      </p>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Order {number}</h1>
            <DemoBadge />
          </div>
          <p className="mt-2 text-sm text-muted">
            {new Date(order.createdAt).toLocaleString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-border px-3 py-1 text-xs">
              <DotStatus
                label={order.paymentStatus === 'PAID' ? 'Paid' : order.paymentStatus}
                tone={order.paymentStatus === 'PAID' ? 'lime' : 'warning'}
              />
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs">
              <DotStatus label={unfulfilled ? 'Unfulfilled' : order.status} tone={unfulfilled ? 'warning' : 'lime'} />
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-outline text-sm">
            More actions
          </button>
          <button type="button" className="btn-primary text-sm" disabled={saving} onClick={markPacked}>
            <IconPackage className="h-4 w-4" />
            {unfulfilled ? 'Mark as packed' : 'Advance fulfilment'}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="panel overflow-hidden">
            <div className="border-b border-border px-5 py-4 font-semibold">Order items</div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-widest text-muted">
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 font-medium">Product</th>
                    <th className="px-5 py-3 font-medium">Price</th>
                    <th className="px-5 py-3 font-medium">Quantity</th>
                    <th className="px-5 py-3 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={`${item.productName}-${i}`} className="border-b border-border">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Thumb label={item.productName} />
                          <div>
                            <p className="font-medium">{item.productName}</p>
                            <p className="text-xs text-muted">{item.variantLabel || 'Default'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted">
                        {formatINR(item.unitPrice ?? item.lineTotal / Math.max(item.quantity, 1))}
                      </td>
                      <td className="px-5 py-4">{item.quantity}</td>
                      <td className="px-5 py-4 font-medium">{formatINR(item.lineTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-2 border-t border-border px-5 py-4 text-sm">
              <div className="flex justify-end gap-8">
                <span className="text-muted">Subtotal</span>
                <span>{formatINR(order.subtotalAmount)}</span>
              </div>
              <div className="flex justify-end gap-8">
                <span className="text-muted">Shipping</span>
                <span>{formatINR(0)}</span>
              </div>
              {(order.discountAmount ?? 0) > 0 && (
                <div className="flex justify-end gap-8">
                  <span className="text-muted">Discount</span>
                  <span>-{formatINR(order.discountAmount ?? 0)}</span>
                </div>
              )}
              <div className="flex justify-end gap-8 text-base font-semibold">
                <span>Total</span>
                <span>{formatINR(order.totalAmount)}</span>
              </div>
            </div>
          </section>

          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Payment</h2>
              <DotStatus
                label={order.paymentStatus === 'PAID' ? 'Paid' : order.paymentStatus}
                tone={order.paymentStatus === 'PAID' ? 'lime' : 'warning'}
              />
            </div>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Method</dt>
                <dd>Test payment (Demo)</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Reference</dt>
                <dd>DEMO-{order._id.slice(-4).toUpperCase()}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Paid on</dt>
                <dd>{formatShortDate(order.createdAt)}</dd>
              </div>
            </dl>
          </section>

          <section className="panel p-5">
            <h2 className="font-semibold">Order timeline</h2>
            <ol className="mt-4 space-y-4">
              {(history.length
                ? history
                : [
                    { status: 'CONFIRMED', timestamp: order.createdAt, note: 'Order confirmed' },
                    {
                      status: order.paymentStatus,
                      timestamp: order.createdAt,
                      note: 'Payment received',
                    },
                    { status: order.status, timestamp: order.createdAt, note: 'Awaiting fulfilment' },
                  ]
              ).map((h, i) => (
                <li key={`${h.status}-${i}`} className="flex gap-3 text-sm">
                  <span
                    className={`mt-1 h-3 w-3 shrink-0 rounded-full ${
                      i < (history.length || 3) - 1 ? 'bg-[#d4ff3f]' : 'border border-muted'
                    }`}
                  />
                  <div>
                    <p className="font-medium">{h.note || h.status}</p>
                    <p className="text-xs text-muted">{formatShortDate(h.timestamp)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Customer</h2>
              <button type="button" className="text-xs text-[#d4ff3f]">
                Edit
              </button>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-panel-2 text-xs font-semibold">
                {initials(order.customer?.name ?? order.shippingAddress.fullName)}
              </span>
              <div>
                <p className="font-medium">{order.customer?.name ?? order.shippingAddress.fullName}</p>
                <p className="text-xs text-muted">{order.customer?.email ?? '—'}</p>
              </div>
            </div>
          </section>

          <section className="panel p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Shipping address</h2>
              <button type="button" className="text-xs text-[#d4ff3f]">
                Edit
              </button>
            </div>
            <p className="mt-3 text-sm">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </section>

          <section className="panel p-5">
            <h2 className="font-semibold">Delivery method</h2>
            <p className="mt-3 text-sm text-muted">Standard (3–5 business days)</p>
          </section>

          <section className="panel p-5">
            <h2 className="font-semibold">Fulfilment</h2>
            <div className="mt-3">
              <DotStatus
                label={unfulfilled ? 'Not dispatched' : order.status}
                tone={unfulfilled ? 'warning' : 'lime'}
              />
            </div>
            <p className="mt-2 text-sm text-muted">
              {unfulfilled ? 'Items are ready to pack and ship.' : 'Shipment is in progress.'}
            </p>
            <button type="button" className="btn-outline mt-4 w-full text-sm">
              Add tracking
            </button>
          </section>

          <section className="panel p-5">
            <h2 className="font-semibold">Internal note</h2>
            <textarea
              className="input-field mt-3 min-h-24"
              maxLength={500}
              placeholder="Add an internal note (visible to your team only)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-muted">{note.length}/500</span>
              <button type="button" className="btn-primary text-sm" onClick={() => toast.success('Note saved locally')}>
                Save note
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
