import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { Breadcrumbs } from '../../components/layout/ShopNavbar';
import type { Order } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';

export function ReturnRequestPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState('Size did not fit');
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'return' | 'exchange'>('return');

  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/${orderId}`).then((res) => setOrder(res.data.data.order));
  }, [orderId]);

  if (!order) return <Skeleton className="h-64 w-full" />;

  const item = order.items[0];

  return (
    <div className="mx-auto max-w-2xl">
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'RETURNS' }]} />
      <h1 className="page-title mt-4">Let&apos;s sort it.</h1>
      <p className="mt-2 text-muted">Initiate a return or exchange for your order.</p>

      <div className="card mt-8 flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="font-semibold">Order #{order._id.slice(-6).toUpperCase()}</p>
          <p className="text-sm text-muted">Delivered {order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : '—'}</p>
        </div>
        <Link to={`/orders/${order._id}`} className="btn-outline text-sm">View order</Link>
      </div>

      <div className="card mt-4 p-5">
        <label className="flex gap-4">
          <input type="checkbox" className="mt-1 accent-accent" defaultChecked />
          <div>
            <p className="font-medium">{item?.productName}</p>
            <p className="text-sm text-muted">{item?.variantLabel} · Qty {item?.quantity}</p>
            <p className="mt-1 font-medium">${item?.lineTotal.toFixed(2)}</p>
          </div>
        </label>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Reason for return</label>
          <select className="input-field" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>Size did not fit</option>
            <option>Changed my mind</option>
            <option>Item damaged</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Additional notes (optional)</label>
          <textarea className="input-field min-h-[100px]" maxLength={500} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <p className="text-right text-xs text-muted">{notes.length}/500</p>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">What would you like to do?</p>
          <label className="flex items-center gap-2 text-sm">
            <input type="radio" name="action" checked={action === 'return'} onChange={() => setAction('return')} className="accent-accent" />
            Return item
          </label>
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input type="radio" name="action" checked={action === 'exchange'} onChange={() => setAction('exchange')} className="accent-accent" />
            Exchange size
          </label>
        </div>
      </div>

      <div className="card mt-6 flex items-center justify-between p-5">
        <div>
          <p className="font-medium">Pickup address</p>
          <p className="text-sm text-muted">{order.shippingAddress.line1}, {order.shippingAddress.city}</p>
        </div>
        <span className="text-muted">→</span>
      </div>

      <p className="mt-4 text-center text-xs text-muted">Eligibility and refund details shown before confirmation.</p>
      <button type="button" className="btn-primary mt-4 w-full" onClick={() => toast.success('Return request submitted')}>
        Review return request →
      </button>
    </div>
  );
}
