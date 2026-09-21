import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import type { Order, Product } from '../../types';
import type { SellerOutletContext } from '../../components/layout/SellerLayout';
import {
  SellerCard,
  SellerEmptyState,
  SellerPill,
  SellerStatCard,
  SellerThumb,
  formatShortDate,
  initials,
  sellerBtnPrimary,
} from '../../components/seller/sellerUi';
import {
  IconCalendar,
  IconChevronDown,
  IconChevronRight,
  IconPackage,
  IconPlus,
  IconReturn,
  IconTruck,
  IconWarning,
} from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';

type OverviewData = {
  revenue?: number;
  orderCount?: number;
  productCount?: number;
  pendingDispatch?: number;
  revenueTrend?: Array<{ date: string; total: number }>;
  needsAttention?: Array<{ type: string; label: string; count: number; sub?: string }>;
  recentOrders?: Array<{
    _id: string;
    orderNumber?: string;
    createdAt: string;
    totalAmount: number;
    status: string;
    customer?: { name?: string } | null;
    items?: Array<{ productName: string; image?: string }>;
    productNames?: string[];
  }>;
  trends?: {
    revenue?: number;
    orders?: number;
    products?: number;
    pendingDispatch?: number;
  };
};

function statusPill(status: string) {
  const s = status.toUpperCase();
  if (s === 'DELIVERED') return { label: 'Delivered', tone: 'success' as const };
  if (s === 'SHIPPED' || s === 'OUT_FOR_DELIVERY') return { label: 'Shipped', tone: 'info' as const };
  if (s === 'CANCELLED') return { label: 'Cancelled', tone: 'danger' as const };
  return { label: 'Processing', tone: 'warning' as const };
}

function Trend({ value, warn }: { value?: number; warn?: boolean }) {
  if (value == null) return null;
  const up = value >= 0;
  return (
    <span className={warn ? 'text-[#dc2626]' : 'text-[#16a34a]'}>
      {up ? '▲' : '▼'} {Math.abs(value)}% vs previous period
    </span>
  );
}

export function OverviewPage() {
  const { sellerProfile } = useOutletContext<SellerOutletContext>();
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        try {
          const res = await api.get('/sellers/overview');
          if (!cancelled) setData(res.data.data ?? res.data);
          return;
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status !== 404) throw err;
        }

        const [productsRes, ordersRes] = await Promise.all([
          api.get('/products/mine', { params: { limit: 100 } }),
          api.get('/orders/seller/mine', { params: { limit: 20 } }),
        ]);
        const products: Product[] = productsRes.data.items ?? [];
        const orders: Order[] = ordersRes.data.items ?? [];
        const pending = orders.filter((o) =>
          ['PLACED', 'CONFIRMED'].includes((o as Order & { myFulfillment?: { status?: string } }).myFulfillment?.status ?? o.status)
        ).length;
        const revenue = orders.reduce((sum, o) => {
          const mine = o.sellerBreakdown?.find((b) => b.storeName === sellerProfile?.storeName);
          return sum + (mine?.subtotal ?? o.subtotalAmount ?? 0);
        }, 0);

        if (!cancelled) {
          setData({
            revenue,
            orderCount: orders.length,
            productCount: products.length,
            pendingDispatch: pending,
            recentOrders: orders.slice(0, 6).map((o) => ({
              _id: o._id,
              createdAt: o.createdAt,
              totalAmount: o.totalAmount,
              status: (o as Order & { myFulfillment?: { status?: string } }).myFulfillment?.status ?? o.status,
              items: o.items?.map((i) => ({ productName: i.productName })),
              productNames: o.items?.map((i) => i.productName),
            })),
            needsAttention: [
              { type: 'DISPATCH', label: `${pending} orders to dispatch`, count: pending, sub: 'Ready to pack and ship' },
              {
                type: 'STOCK',
                label: 'Low-stock products',
                count: 0,
                sub: 'Keep inventory healthy',
              },
            ].filter((a) => a.count > 0 || a.type === 'STOCK'),
            revenueTrend: orders
              .slice()
              .reverse()
              .map((o) => ({ date: o.createdAt, total: o.subtotalAmount ?? 0 })),
          });
        }
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sellerProfile?.storeName]);

  const chart = useMemo(() => {
    const points = data?.revenueTrend ?? [];
    if (!points.length) return { line: '', area: '', labels: [] as string[] };
    const values = points.map((p) => p.total);
    const max = Math.max(...values, 1);
    const w = 520;
    const h = 160;
    const step = points.length > 1 ? w / (points.length - 1) : w;
    const coords = values.map((v, i) => {
      const x = i * step;
      const y = h - (v / max) * (h - 20) - 10;
      return `${x},${y}`;
    });
    const line = coords.join(' ');
    const area = `0,${h} ${line} ${w},${h}`;
    const labels = [points[0], points[Math.floor(points.length / 2)], points[points.length - 1]]
      .filter(Boolean)
      .map((p) => formatShortDate(p!.date));
    return { line, area, labels };
  }, [data?.revenueTrend]);

  if (loading) return <Skeleton className="h-96 w-full !bg-[#e5e5e5]" />;

  const store = sellerProfile?.storeName ?? 'your store';
  const attention = data?.needsAttention ?? [];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#111] md:text-4xl">Your store, at a glance.</h1>
          <p className="mt-2 text-sm text-[#6b7280]">Here is how {store} is doing today.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-[8px] border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#374151]"
          >
            <IconCalendar className="h-4 w-4 text-[#6b7280]" />
            This month
            <IconChevronDown className="h-3.5 w-3.5 text-[#9ca3af]" />
          </button>
          <span className="rounded-full bg-[#eff6ff] px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-[#1d4ed8]">
            Demo data
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SellerStatCard
          label="Revenue"
          value={formatINR(data?.revenue ?? 0)}
          sub={<Trend value={data?.trends?.revenue ?? 12} />}
        />
        <SellerStatCard
          label="Orders"
          value={data?.orderCount ?? 0}
          sub={<Trend value={data?.trends?.orders ?? 16} />}
        />
        <SellerStatCard
          label="Products"
          value={data?.productCount ?? 0}
          sub={<Trend value={data?.trends?.products ?? 6} />}
        />
        <SellerStatCard
          label="Pending dispatch"
          value={data?.pendingDispatch ?? 0}
          warn={(data?.pendingDispatch ?? 0) > 0}
          sub={<Trend value={data?.trends?.pendingDispatch ?? 33} warn />}
          icon={<IconTruck className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <SellerCard className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">Sales performance</h2>
            <button type="button" className="inline-flex items-center gap-1 text-sm text-[#6b7280]">
              Revenue <IconChevronDown className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-end gap-3">
            <p className="text-2xl font-semibold">{formatINR(data?.revenue ?? 0)}</p>
            <Trend value={data?.trends?.revenue ?? 12} />
          </div>
          <div className="mt-4 overflow-hidden">
            <svg viewBox="0 0 520 160" className="h-40 w-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sellerSalesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop stopColor="#d4ff3f" stopOpacity="0.35" />
                  <stop offset="1" stopColor="#d4ff3f" stopOpacity="0" />
                </linearGradient>
              </defs>
              {chart.area ? <polygon fill="url(#sellerSalesFill)" points={chart.area} /> : null}
              <polyline
                fill="none"
                stroke="#d4ff3f"
                strokeWidth="2.5"
                strokeLinejoin="round"
                points={chart.line || '0,120 520,120'}
              />
            </svg>
            <div className="mt-1 flex justify-between text-[11px] text-[#9ca3af]">
              {(chart.labels.length ? chart.labels : ['—', '—', '—']).map((l, i) => (
                <span key={`${l}-${i}`}>{l}</span>
              ))}
            </div>
          </div>
        </SellerCard>

        <SellerCard className="p-5">
          <h2 className="text-base font-semibold">Action needed</h2>
          <ul className="mt-4 space-y-2">
            {attention.length === 0 ? (
              <li className="rounded-[10px] border border-[#e5e5e5] px-3 py-4 text-sm text-[#6b7280]">
                You&apos;re all caught up.
              </li>
            ) : (
              attention.map((item) => {
                const Icon =
                  item.type.includes('STOCK') || item.type.includes('LOW')
                    ? IconWarning
                    : item.type.includes('RETURN')
                      ? IconReturn
                      : IconTruck;
                const to =
                  item.type.includes('RETURN')
                    ? '/seller/returns'
                    : item.type.includes('STOCK')
                      ? '/seller/products'
                      : '/seller/orders';
                const color =
                  item.type.includes('STOCK')
                    ? 'text-[#ea580c] bg-[#fff7ed]'
                    : item.type.includes('RETURN')
                      ? 'text-[#2563eb] bg-[#eff6ff]'
                      : 'text-[#dc2626] bg-[#fef2f2]';
                return (
                  <li key={item.type + item.label}>
                    <Link
                      to={to}
                      className="flex items-center gap-3 rounded-[10px] border border-[#e5e5e5] px-3 py-3 hover:bg-[#fafafa]"
                    >
                      <span className={`flex h-9 w-9 items-center justify-center rounded-[8px] ${color}`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{item.label}</p>
                        <p className="text-xs text-[#6b7280]">{item.sub ?? 'Review now'}</p>
                      </div>
                      <IconChevronRight className="h-4 w-4 text-[#9ca3af]" />
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </SellerCard>
      </div>

      <SellerCard className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5e5] px-5 py-4">
          <div className="flex items-center gap-2">
            <IconPackage className="h-4 w-4 text-[#6b7280]" />
            <h2 className="text-base font-semibold">Recent orders</h2>
          </div>
          <Link to="/seller/products/new" className={sellerBtnPrimary('!py-2')}>
            <IconPlus className="h-4 w-4" />
            New product
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-widest text-[#9ca3af]">
              <tr className="border-b border-[#e5e5e5]">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recentOrders ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <SellerEmptyState message="No orders yet." />
                  </td>
                </tr>
              ) : (
                (data?.recentOrders ?? []).map((row) => {
                  const pill = statusPill(row.status);
                  const product = row.items?.[0]?.productName ?? row.productNames?.[0] ?? '—';
                  const customer = row.customer?.name ?? 'Customer';
                  return (
                    <tr key={row._id} className="border-b border-[#f0f0f0] last:border-0">
                      <td className="px-5 py-3.5 font-medium">
                        <Link to={`/seller/orders/${row._id}`} className="hover:underline">
                          #{row.orderNumber ?? row._id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f4f6] text-[10px] font-semibold">
                            {initials(customer)}
                          </span>
                          {customer}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <SellerThumb label={product} className="h-8 w-8" />
                          <span className="truncate max-w-[160px]">{product}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">{formatINR(row.totalAmount)}</td>
                      <td className="px-5 py-3.5">
                        <SellerPill tone={pill.tone}>{pill.label}</SellerPill>
                      </td>
                      <td className="px-5 py-3.5 text-[#6b7280]">{formatShortDate(row.createdAt)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SellerCard>
    </div>
  );
}
