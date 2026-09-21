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
  StatCard,
  Thumb,
  formatShortDate,
} from '../../components/admin/adminUi';
import {
  IconCalendar,
  IconChevronDown,
  IconChevronRight,
  IconMore,
  IconPackage,
  IconPlus,
  IconTruck,
  IconWarning,
} from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';
import { friendlyOrderStatus, orderStatusVariant, StatusBadge } from '../../components/ui/StatusBadge';

type AttentionItem = { type: string; label: string; count: number };
type TrendPoint = { date: string; total: number };
type RecentOrder = {
  _id: string;
  orderNumber?: string;
  createdAt: string;
  totalAmount: number;
  paymentStatus: string;
  status: string;
  productNames?: string[];
  items?: Array<{ productName: string }>;
  customer?: { name?: string } | null;
};

type OverviewData = {
  revenue: number;
  orderCount: number;
  productCount: number;
  lowStockCount: number;
  needsAttention: AttentionItem[];
  recentOrders: RecentOrder[];
  revenueTrend: TrendPoint[];
};

type PendingSeller = {
  _id: string;
  storeName: string;
  userId: { name: string; email: string };
};

const attentionMeta: Record<string, { sub: string; icon: typeof IconWarning; to: string }> = {
  LOW_STOCK: { sub: 'Reorder soon to avoid stockouts', icon: IconWarning, to: '/admin/inventory' },
  PENDING_SHIPMENTS: { sub: 'Orders ready to ship', icon: IconTruck, to: '/admin/orders' },
  PENDING_SELLERS: { sub: 'Awaiting approval', icon: IconPackage, to: '/admin' },
};

export function OverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [pending, setPending] = useState<PendingSeller[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [overviewRes, sellersRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/sellers/pending'),
      ]);
      setData(overviewRes.data.data);
      setPending(sellersRes.data.items ?? []);
    } catch {
      toast.error('Failed to load overview');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const chart = useMemo(() => {
    const points = data?.revenueTrend ?? [];
    const max = Math.max(...points.map((p) => p.total), 1);
    const coords = points.map((p, i) => {
      const x = points.length <= 1 ? 0 : (i / (points.length - 1)) * 400;
      const y = 120 - (p.total / max) * 100;
      return { x, y, ...p };
    });
    const line = coords.map((c) => `${c.x},${c.y}`).join(' ');
    const area = coords.length
      ? `${line} ${coords[coords.length - 1].x},140 0,140`
      : '0,140 400,140';
    return { coords, line, area, max };
  }, [data]);

  if (loading) return <Skeleton className="h-96 w-full" />;

  const attention = [
    ...(data?.needsAttention ?? []),
    ...(pending.length
      ? [
          {
            type: 'PENDING_SELLERS',
            label: `${pending.length} pending seller${pending.length === 1 ? '' : 's'}`,
            count: pending.length,
          } satisfies AttentionItem,
        ]
      : []),
  ].filter((item, idx, arr) => arr.findIndex((x) => x.type === item.type) === idx);

  return (
    <div>
      <PageHeader
        title="Store overview"
        subtitle="Welcome back! Here's what's happening with your store today."
        actions={
          <>
            <button type="button" className="btn-outline text-sm">
              <IconCalendar className="h-3.5 w-3.5" />
              Last 7 days
              <IconChevronDown className="h-3.5 w-3.5" />
            </button>
            <Link to="/admin/products/new" className="btn-primary text-sm">
              <IconPlus className="h-4 w-4" />
              Add product
            </Link>
          </>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatINR(data?.revenue ?? 0)} sub="vs. previous 7 days" />
        <StatCard label="Orders" value={data?.orderCount ?? 0} sub="vs. previous 7 days" />
        <StatCard label="Products" value={data?.productCount ?? 0} sub="vs. previous 7 days" />
        <StatCard
          label="Low-stock products"
          value={data?.lowStockCount ?? 0}
          sub="vs. previous 7 days"
          warn={(data?.lowStockCount ?? 0) > 0}
          icon={<IconWarning className="h-4 w-4 text-warning" />}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="panel p-6 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold">Revenue trend</p>
              <p className="mt-1 text-sm text-muted">Last 7 days</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{formatINR(data?.revenue ?? 0)}</p>
              <DemoBadge className="mt-1" />
            </div>
          </div>
          <svg viewBox="0 0 400 150" className="mt-4 h-44 w-full" aria-hidden>
            <defs>
              <linearGradient id="adminRevFill" x1="0" x2="0" y1="0" y2="1">
                <stop stopColor="#d4ff3f" stopOpacity="0.35" />
                <stop offset="1" stopColor="#d4ff3f" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[0, 30, 60, 90, 120].map((y) => (
              <line key={y} x1="0" x2="400" y1={y + 10} y2={y + 10} stroke="rgba(255,255,255,0.06)" />
            ))}
            <polyline fill="url(#adminRevFill)" stroke="none" points={chart.area} />
            <polyline fill="none" stroke="#d4ff3f" strokeWidth="2.5" strokeLinejoin="round" points={chart.line || '0,120'} />
            {chart.coords.map((c) => (
              <text key={c.date} x={c.x} y={146} fill="#9ca3af" fontSize="9" textAnchor="middle">
                {formatShortDate(c.date).replace(/ \d{4}$/, '')}
              </text>
            ))}
          </svg>
        </div>

        <div className="panel p-6">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Needs attention</p>
            <Link to="/admin/orders" className="text-xs text-[#d4ff3f]">
              View all →
            </Link>
          </div>
          <ul className="mt-4 space-y-1">
            {attention.length === 0 ? (
              <li className="px-2 py-6 text-sm text-muted">All clear — nothing needs attention.</li>
            ) : (
              attention.map((item) => {
                const meta = attentionMeta[item.type] ?? {
                  sub: 'Review now',
                  icon: IconWarning,
                  to: '/admin',
                };
                const Icon = meta.icon;
                return (
                  <li key={item.type + item.label}>
                    <Link
                      to={meta.to}
                      className="flex w-full items-center gap-3 rounded-[8px] px-2 py-3 text-left text-sm hover:bg-white/5"
                    >
                      <Icon className="h-4 w-4 shrink-0 text-muted" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium">{item.label}</span>
                        <span className="block text-xs text-muted">{meta.sub}</span>
                      </span>
                      <IconChevronRight className="h-4 w-4 text-muted" />
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
          {pending.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-border pt-4">
              {pending.slice(0, 3).map((s) => (
                <div key={s._id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-muted">
                    {s.storeName} · {s.userId?.email}
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-primary px-3 py-1.5 text-xs"
                      onClick={async () => {
                        await api.post(`/admin/sellers/${s._id}/approve`);
                        toast.success('Approved');
                        load();
                      }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="btn-outline px-3 py-1.5 text-xs"
                      onClick={async () => {
                        await api.post(`/admin/sellers/${s._id}/reject`);
                        load();
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <p className="font-semibold">Recent orders</p>
          <Link to="/admin/orders" className="text-xs text-[#d4ff3f]">
            View all orders →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-widest text-muted">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Payment</th>
                <th className="px-5 py-3 font-medium">Fulfillment</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState message="No recent orders yet." />
                  </td>
                </tr>
              ) : (
                (data?.recentOrders ?? []).map((row) => {
                  const product =
                    row.productNames?.[0] ?? row.items?.[0]?.productName ?? 'Order items';
                  return (
                    <tr key={row._id} className="border-b border-border last:border-0">
                      <td className="px-5 py-4 align-middle">
                        <Link to={`/admin/orders/${row._id}`} className="font-medium hover:text-[#d4ff3f]">
                          {row.orderNumber ?? `#${row._id.slice(-6).toUpperCase()}`}
                        </Link>
                        <p className="text-xs text-muted">{formatShortDate(row.createdAt)}</p>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="flex items-center gap-3">
                          <Thumb label={product} />
                          <div>
                            <p className="font-medium">{product}</p>
                            <p className="text-xs text-muted">
                              {(row.productNames?.length ?? row.items?.length ?? 1) > 1
                                ? `${row.productNames?.length ?? row.items?.length} items`
                                : 'Catalog'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted">{row.customer?.name ?? '—'}</td>
                      <td className="px-5 py-4 font-medium">{formatINR(row.totalAmount)}</td>
                      <td className="px-5 py-4">
                        <DotStatus
                          label={row.paymentStatus === 'PAID' ? 'Paid' : row.paymentStatus === 'PENDING' ? 'Pending' : row.paymentStatus}
                          tone={row.paymentStatus === 'PAID' ? 'lime' : row.paymentStatus === 'PENDING' ? 'warning' : 'neutral'}
                        />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge label={friendlyOrderStatus(row.status)} variant={orderStatusVariant(row.status)} />
                      </td>
                      <td className="px-5 py-4">
                        <Link to={`/admin/orders/${row._id}`} className="text-muted hover:text-text" aria-label="Open order">
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
      </div>
    </div>
  );
}
