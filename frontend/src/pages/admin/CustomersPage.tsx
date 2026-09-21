import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import {
  DotStatus,
  EmptyState,
  PageHeader,
  Pagination,
  StatCard,
  formatShortDate,
  initials,
} from '../../components/admin/adminUi';
import { IconClose, IconDownload, IconMore } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

type Customer = {
  _id: string;
  name: string;
  email: string;
  createdAt: string;
  isActive: boolean;
  orderCount: number;
  totalSpent: number;
  lastOrderAt?: string | null;
};

export function CustomersPage() {
  const [items, setItems] = useState<Customer[]>([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const debouncedQ = useDebouncedValue(q, 300);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/customers', {
          params: { page: 1, limit: 50, q: debouncedQ || undefined },
        });
        if (!cancelled) {
          const list = res.data.items ?? [];
          setItems(list);
          setMeta(res.data.meta ?? { page: 1, total: 0, totalPages: 1 });
          if (!selectedId && list[0]) setSelectedId(list[0]._id);
        }
      } catch {
        toast.error('Failed to load customers');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQ]);

  const selected = items.find((c) => c._id === selectedId) ?? null;

  const stats = useMemo(() => {
    const returning = items.filter((c) => c.orderCount > 1).length;
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const neu = items.filter((c) => new Date(c.createdAt) >= monthStart).length;
    return {
      total: meta.total || items.length,
      returning,
      neu,
    };
  }, [items, meta.total]);

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage your customers and their order history."
        actions={
          <button type="button" className="btn-outline text-sm">
            <IconDownload className="h-4 w-4" />
            Export
          </button>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total customers" value={stats.total} />
        <StatCard label="Returning customers" value={stats.returning} />
        <StatCard label="New this month" value={stats.neu} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="panel overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
            <input
              className="input-field max-w-md flex-1"
              placeholder="Search customers by name or email..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className="input-field w-auto" defaultValue="all">
              <option value="all">All customers</option>
            </select>
            <select className="input-field w-auto" defaultValue="latest">
              <option value="latest">Sort by latest</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-widest text-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Orders</th>
                  <th className="px-5 py-3 font-medium">Total spent</th>
                  <th className="px-5 py-3 font-medium">Last order</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState message="No customers found." />
                    </td>
                  </tr>
                ) : (
                  items.map((c) => (
                    <tr
                      key={c._id}
                      onClick={() => setSelectedId(c._id)}
                      className={`cursor-pointer border-b border-border last:border-0 ${
                        selectedId === c._id ? 'bg-white/[0.03] outline outline-1 outline-[#d4ff3f]/50' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-panel-2 text-xs font-semibold">
                            {initials(c.name)}
                          </span>
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-xs text-muted">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">{c.orderCount}</td>
                      <td className="px-5 py-4 font-medium">{formatINR(c.totalSpent)}</td>
                      <td className="px-5 py-4 text-muted">{formatShortDate(c.lastOrderAt)}</td>
                      <td className="px-5 py-4">
                        <DotStatus label={c.isActive ? 'Active' : 'Inactive'} tone={c.isActive ? 'lime' : 'warning'} />
                      </td>
                      <td className="px-5 py-4">
                        <button type="button" className="text-muted hover:text-text">
                          <IconMore className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages || 1}
            summary={`Showing ${items.length} of ${meta.total || items.length} customers`}
          />
        </div>

        <aside className="panel overflow-hidden">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-panel-2 text-sm font-semibold">
                    {initials(selected.name)}
                  </span>
                  <div>
                    <p className="font-semibold">{selected.name}</p>
                    <p className="text-xs text-muted">{selected.email}</p>
                    <p className="mt-1 text-xs text-muted">Customer since {formatShortDate(selected.createdAt)}</p>
                  </div>
                </div>
                <button type="button" className="text-muted hover:text-text" onClick={() => setSelectedId(null)}>
                  <IconClose className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 border-b border-border px-5 py-4 text-center text-sm">
                <div>
                  <p className="text-lg font-semibold">{selected.orderCount}</p>
                  <p className="text-[11px] text-muted">Orders</p>
                </div>
                <div>
                  <p className="text-lg font-semibold">{formatINR(selected.totalSpent)}</p>
                  <p className="text-[11px] text-muted">Total spent</p>
                </div>
                <div>
                  <p className="text-sm font-semibold">{formatShortDate(selected.lastOrderAt)}</p>
                  <p className="text-[11px] text-muted">Last order</p>
                </div>
              </div>

              <div className="border-b border-border px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Recent orders</p>
                  <Link to="/admin/orders" className="text-xs text-[#d4ff3f]">
                    View all orders →
                  </Link>
                </div>
                <p className="mt-3 text-sm text-muted">Open Orders to view this customer&apos;s purchases.</p>
              </div>

              <div className="border-b border-border px-5 py-4">
                <p className="font-semibold">Customer notes</p>
                <textarea
                  className="input-field mt-3 min-h-20"
                  placeholder="Add an internal note about this customer..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
                <button
                  type="button"
                  className="btn-primary mt-3 w-full text-sm"
                  onClick={() => toast.success('Note saved')}
                >
                  Save note
                </button>
              </div>

              <div className="px-5 py-4 text-sm">
                <p className="font-semibold">Contact information</p>
                <p className="mt-3 text-muted">{selected.email}</p>
                <p className="mt-1 text-muted">India</p>
              </div>
            </>
          ) : (
            <div className="px-5 py-12 text-center text-sm text-muted">Select a customer to view details.</div>
          )}
        </aside>
      </div>
    </div>
  );
}
