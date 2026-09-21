import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import { DemoBadge, PageHeader, StatCard, Thumb } from '../../components/admin/adminUi';
import { IconCalendar, IconChevronDown, IconDownload } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';

type ReportsData = {
  periodDays: number;
  netSales: number;
  orders: number;
  aov: number;
  returnRate: number;
  returnedCount: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    unitsSold: number;
    revenue: number;
  }>;
  salesByCategory: Array<{
    categoryId: string;
    categoryName: string;
    revenue: number;
    unitsSold: number;
  }>;
};

export function ReportsPage() {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('sales');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/reports');
        setData(res.data.data);
      } catch {
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categoryShares = useMemo(() => {
    const cats = data?.salesByCategory ?? [];
    const total = cats.reduce((s, c) => s + c.revenue, 0) || 1;
    return cats.map((c) => ({ ...c, share: (c.revenue / total) * 100 }));
  }, [data]);

  const salesBars = useMemo(() => {
    const top = data?.topProducts ?? [];
    const max = Math.max(...top.map((p) => p.revenue), 1);
    return Array.from({ length: 7 }, (_, i) => {
      const p = top[i % Math.max(top.length, 1)];
      return p ? (p.revenue / max) * 100 : 20 + ((i * 13) % 40);
    });
  }, [data]);

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <PageHeader
        title="Reports & analytics"
        subtitle="Track your store performance and discover insights."
        actions={
          <>
            <button type="button" className="btn-outline text-sm">
              <IconCalendar className="h-3.5 w-3.5" />
              Last {data?.periodDays ?? 30} days
              <IconChevronDown className="h-3.5 w-3.5" />
            </button>
            <button type="button" className="btn-primary text-sm">
              <IconDownload className="h-4 w-4" />
              Export report
            </button>
          </>
        }
      />

      <div className="mt-6 flex gap-4 border-b border-border">
        {[
          { id: 'sales', label: 'Sales' },
          { id: 'products', label: 'Products' },
          { id: 'customers', label: 'Customers' },
        ].map((t) => (
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Net sales" value={formatINR(data?.netSales ?? 0)} sub="vs. previous 30 days" />
        <StatCard label="Orders" value={data?.orders ?? 0} sub="vs. previous 30 days" />
        <StatCard
          label="Average order value"
          value={formatINR(Math.round(data?.aov ?? 0))}
          sub="vs. previous 30 days"
        />
        <StatCard
          label="Return rate"
          value={`${((data?.returnRate ?? 0) * 100).toFixed(1)}%`}
          sub="vs. previous 30 days"
          warn={(data?.returnRate ?? 0) > 0.05}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">Net sales</p>
              <p className="mt-1 text-sm text-muted">{formatINR(data?.netSales ?? 0)}</p>
            </div>
            <DemoBadge />
          </div>
          <svg viewBox="0 0 400 160" className="mt-4 h-44 w-full" aria-hidden>
            <defs>
              <linearGradient id="reportSalesFill" x1="0" x2="0" y1="0" y2="1">
                <stop stopColor="#d4ff3f" stopOpacity="0.3" />
                <stop offset="1" stopColor="#d4ff3f" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline
              fill="url(#reportSalesFill)"
              points="0,120 57,100 114,110 171,70 228,80 285,45 342,55 400,30 400,160 0,160"
            />
            <polyline
              fill="none"
              stroke="#d4ff3f"
              strokeWidth="2.5"
              points="0,120 57,100 114,110 171,70 228,80 285,45 342,55 400,30"
            />
          </svg>
        </section>

        <section className="panel p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold">Orders</p>
              <p className="mt-1 text-sm text-muted">{data?.orders ?? 0}</p>
            </div>
            <DemoBadge />
          </div>
          <div className="mt-6 flex h-40 items-end gap-2">
            {salesBars.map((h, i) => (
              <div key={i} className="flex-1 rounded-t bg-white/15" style={{ height: `${Math.max(12, h)}%` }} />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="font-semibold">Top products</p>
            <Link to="/admin/products" className="text-xs text-[#d4ff3f]">
              View all products →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[11px] uppercase tracking-widest text-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-medium">#</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Units sold</th>
                  <th className="px-5 py-3 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(data?.topProducts ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-muted">
                      No sales in this period.
                    </td>
                  </tr>
                ) : (
                  (data?.topProducts ?? []).map((p, i) => (
                    <tr key={String(p.productId) + i} className="border-b border-border last:border-0">
                      <td className="px-5 py-4 text-muted">{i + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Thumb label={p.productName} />
                          <span className="font-medium">{p.productName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">{p.unitsSold}</td>
                      <td className="px-5 py-4 font-medium">{formatINR(p.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <p className="font-semibold">Sales by category</p>
            <span className="text-xs text-[#d4ff3f]">View all categories →</span>
          </div>
          <ul className="divide-y divide-border">
            {categoryShares.length === 0 ? (
              <li className="px-5 py-10 text-center text-sm text-muted">No category sales yet.</li>
            ) : (
              categoryShares.map((c) => (
                <li key={String(c.categoryId)} className="flex items-center gap-4 px-5 py-4 text-sm">
                  <span className="min-w-0 flex-1 font-medium">{c.categoryName}</span>
                  <span className="font-medium">{formatINR(c.revenue)}</span>
                  <div className="w-28">
                    <div className="mb-1 text-right text-xs text-muted">{c.share.toFixed(0)}%</div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-[#d4ff3f]" style={{ width: `${c.share}%` }} />
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
