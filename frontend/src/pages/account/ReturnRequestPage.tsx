import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import { Breadcrumbs } from '../../components/layout/ShopNavbar';
import { IconChevronRight, IconPin } from '../../components/icons/Icons';
import type { Order } from '../../types';
import { Skeleton } from '../../components/ui/Skeleton';

export function ReturnRequestPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [reason, setReason] = useState('Size did not fit');
  const [notes, setNotes] = useState('');
  const [action, setAction] = useState<'return' | 'exchange'>('return');
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!orderId) return;
    api.get(`/orders/${orderId}`).then((res) => setOrder(res.data.data.order));
  }, [orderId]);

  if (!order) return <Skeleton className="h-64 w-full" />;

  const item = order.items[selected] ?? order.items[0];
  const shortId = order._id.slice(-4).toUpperCase();
  const deliveredLabel = order.deliveredAt
    ? `Delivered ${new Date(order.deliveredAt).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`
    : 'Delivered';

  return (
    <div className="mx-auto max-w-lg">
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'RETURNS' }]} />
      <h1 className="page-title mt-4">Let&apos;s sort it.</h1>
      <p className="mt-3 text-sm text-muted">Initiate a return or exchange for your order.</p>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Order #{shortId}</p>
          <p className="text-sm text-muted">{deliveredLabel}</p>
        </div>
        <Link to={`/orders/${order._id}`} className="btn-outline text-sm">
          View order
        </Link>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium">Select item to return</p>
        <ul className="space-y-3">
          {order.items.map((row, idx) => (
            <li key={idx}>
              <button
                type="button"
                onClick={() => setSelected(idx)}
                className={`panel flex w-full items-center gap-3 p-4 text-left transition ${
                  selected === idx ? 'border-[#d4ff3f]/60' : ''
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                    selected === idx
                      ? 'border-[#d4ff3f] bg-[#d4ff3f] text-accent-fg'
                      : 'border-border'
                  }`}
                >
                  {selected === idx ? (
                    <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  ) : null}
                </span>
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[8px] border border-border bg-panel-2 text-[10px] uppercase text-muted">
                  {row.productName.slice(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{row.productName}</p>
                  <p className="text-xs text-muted">
                    {row.variantLabel || 'Standard'} · Qty {row.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-medium">{formatINR(row.lineTotal)}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium">Reason for return</label>
          <select className="input-field" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>Size did not fit</option>
            <option>Changed my mind</option>
            <option>Item damaged</option>
            <option>Wrong item received</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium">Additional notes (optional)</label>
          <textarea
            className="input-field min-h-[100px] resize-none"
            maxLength={500}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tell us more…"
          />
          <p className="mt-1 text-right text-xs text-muted">{notes.length}/500</p>
        </div>
        <div>
          <p className="mb-3 text-sm font-medium">What would you like to do?</p>
          <div className="space-y-2">
            {(
              [
                { id: 'return' as const, label: 'Return item' },
                { id: 'exchange' as const, label: 'Exchange size' },
              ]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAction(opt.id)}
                className="flex w-full items-center gap-3 rounded-[8px] border border-border px-4 py-3 text-left text-sm"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                    action === opt.id ? 'border-[#d4ff3f] bg-[#d4ff3f]' : 'border-border'
                  }`}
                >
                  {action === opt.id ? <span className="h-1.5 w-1.5 rounded-full bg-accent-fg" /> : null}
                </span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="button" className="panel mt-6 flex w-full items-center gap-3 p-4 text-left">
        <IconPin className="h-5 w-5 shrink-0 text-[#d4ff3f]" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">Home</p>
          <p className="truncate text-xs text-muted">
            {order.shippingAddress.line1}, {order.shippingAddress.city}{' '}
            {order.shippingAddress.postalCode}
          </p>
        </div>
        <IconChevronRight className="h-4 w-4 shrink-0 text-muted" />
      </button>

      <p className="mt-4 text-center text-xs text-muted">
        Eligibility and refund details shown before confirmation.
        {item ? ` Returning ${item.productName}.` : ''}
      </p>
      <button
        type="button"
        className="btn-primary mt-4 w-full"
        onClick={() => toast.success('Return request submitted')}
      >
        Review return request →
      </button>
    </div>
  );
}
