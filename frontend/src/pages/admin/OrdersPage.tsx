import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import {
  DemoBadge,
  DotStatus,
  EmptyState,
  PageHeader,
  Pagination,
  StatCard,
  Thumb,
  formatShortDate,
} from '../../components/admin/adminUi';
import { IconCalendar, IconChevronDown, IconDownload, IconMore } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

type AdminOrder = {
  _id: string;
  orderNumber?: string;
  createdAt: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  productNames?: string[];
  items?: Array<{ productName: string; quantity: number }>;
  customer?: { name?: string; email?: string } | null;
};

function paymentTone(status: string) {
  if (status === 'PAID') return 'lime' as const;
  if (status === 'PENDING') return 'warning' as const;
  if (status === 'REFUNDED') return 'danger' as const;
  return 'neutral' as const;
}

function fulfillmentLabel(status: string) {
  const s = status.toUpperCase();
  if (s === 'PLACED' || s === 'CONFIRMED') return 'Unfulfilled';
  if (s === 'SHIPPED' || s === 'OUT_FOR_DELIVERY') return 'Shipped';
  if (s === 'DELIVERED') return 'Delivered';
  if (s === 'CANCELLED') return 'Cancelled';
  if (s === 'RETURNED') return 'Returned';
  return status;
}

function fulfillmentTone(status: string) {
  const s = status.toUpperCase();
  if (s === 'PLACED' || s === 'CONFIRMED') return 'warning' as const;
  if (s === 'SHIPPED' || s === 'OUT_FOR_DELIVERY' || s === 'DELIVERED') return 'lime' as const;
  if (s === 'CANCELLED' || s === 'RETURNED') return 'danger' as const;
  return 'neutral' as const;
}

export function OrdersPage() {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 300);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/orders', {
          params: { page: 1, limit: 50, q: debouncedQ || undefined },
        });
        if (!cancelled) {
          setItems(res.data.items ?? []);
          setMeta(res.data.meta ?? { page: 1, total: 0, totalPages: 1 });
        }
      } catch {
        toast.error('Failed to load orders');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const counts = useMemo(() => {
    const toFulfil = items.filter((o) => ['PLACED', 'CONFIRMED'].includes(o.status)).length;
    const shipped = items.filter((o) => ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
    const delivered = items.filter((o) => o.status === 'DELIVERED').length;
    const cancelled = items.filter((o) => o.status === 'CANCELLED').length;
    return {
      all: meta.total || items.length,
      toFulfil,
      shipped,
      delivered,
      cancelled,
    };
  }, [items, meta.total]);

  const filtered = useMemo(() => {
    if (tab === 'unfulfilled') return items.filter((o) => ['PLACED', 'CONFIRMED'].includes(o.status));
    if (tab === 'transit') return items.filter((o) => ['SHIPPED', 'OUT_FOR_DELIVERY'].includes(o.status));
    if (tab === 'completed') return items.filter((o) => o.status === 'DELIVERED');
    return items;
  }, [items, tab]);

  if (loading) return <Skeleton className="h-96 w-full" />;

  const tabs = [
    { id: 'all', label: `All (${counts.all})` },
    { id: 'unfulfilled', label: `Unfulfilled (${counts.toFulfil})` },
    { id: 'transit', label: `In transit (${counts.shipped})` },
    { id: 'completed', label: `Completed (${counts.delivered})` },
  ];

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Manage and track customer orders."
        actions={
          <button type="button" className="btn-outline text-sm">
            <IconDownload className="h-4 w-4" />
            Export
          </button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="All orders" value={counts.all} />
        <StatCard label="To fulfil" value={counts.toFulfil} />
        <StatCard label="Shipped" value={counts.shipped} />
        <StatCard label="Delivered" value={counts.delivered} />
        <StatCard label="Cancelled" value={counts.cancelled} />
      </div>

      <div className="panel mt-6 overflow-hidden">
        <div className="flex flex-wrap gap-4 border-b border-border px-5 pt-4">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`border-b-2 pb-3 text-sm ${
                tab === t.id ? 'border-[#d4ff3f] text-white' : 'border-transparent text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <input
            className="input-field max-w-md flex-1"
            placeholder="Search orders by ID, customer name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="button" className="btn-outline text-sm">
            <IconCalendar className="h-3.5 w-3.5" />
            Last 30 days
            <IconChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-widest text-muted">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">
                  <input type="checkbox" aria-label="Select all" />
                </th>
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Order date</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Payment status</th>
                <th className="px-5 py-3 font-medium">Fulfilment status</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <EmptyState message="No orders found." />
                  </td>
                </tr>
              ) : (
                filtered.map((o) => {
                  const itemCount = o.items?.length ?? o.productNames?.length ?? 0;
                  return (
                    <tr key={o._id} className="border-b border-border last:border-0">
                      <td className="px-5 py-4">
                        <input type="checkbox" aria-label="Select order" />
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/admin/orders/${o._id}`} className="font-medium hover:text-[#d4ff3f]">
                          {o.orderNumber ?? `#${o._id.slice(-6).toUpperCase()}`}
                        </Link>
                        <div className="mt-1">
                          <DemoBadge />
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium">{o.customer?.name ?? '—'}</p>
                        <p className="text-xs text-muted">{o.customer?.email ?? ''}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Thumb label={o.productNames?.[0] ?? o.items?.[0]?.productName} />
                          <span className="text-muted">{itemCount} item{itemCount === 1 ? '' : 's'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted">{formatShortDate(o.createdAt)}</td>
                      <td className="px-5 py-4 font-medium">{formatINR(o.totalAmount)}</td>
                      <td className="px-5 py-4">
                        <DotStatus
                          label={
                            o.paymentStatus === 'PAID'
                              ? 'Paid'
                              : o.paymentStatus === 'PENDING'
                                ? 'Pending'
                                : o.paymentStatus === 'REFUNDED'
                                  ? 'Refunded'
                                  : o.paymentStatus
                          }
                          tone={paymentTone(o.paymentStatus)}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <DotStatus label={fulfillmentLabel(o.status)} tone={fulfillmentTone(o.status)} />
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/admin/orders/${o._id}`} className="text-muted hover:text-text">
                          <IconMore className="h-5 w-5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages || 1}
          summary={`Showing ${filtered.length} of ${meta.total || items.length} orders`}
        />
      </div>
    </div>
  );
}
