import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import type { Product } from '../../types';
import {
  DemoBadge,
  DotStatus,
  EmptyState,
  PageHeader,
  Pagination,
  StatCard,
  Thumb,
} from '../../components/admin/adminUi';
import { IconBag, IconMore, IconPackage, IconPlus } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

export function ProductsPage() {
  const [items, setItems] = useState<Product[]>([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const debouncedQ = useDebouncedValue(q, 300);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/products/admin/all', { params: { page: 1, limit: 50 } });
        if (!cancelled) {
          setItems(res.data.items ?? []);
          setMeta(res.data.meta ?? { page: 1, total: 0, totalPages: 1 });
        }
      } catch {
        toast.error('Failed to load products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const needle = debouncedQ.trim().toLowerCase();
    return items.filter((p) => {
      if (status === 'active' && !p.isActive) return false;
      if (status === 'draft' && p.isActive) return false;
      if (status === 'archived' && p.isActive !== false) return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        (p.description ?? '').toLowerCase().includes(needle)
      );
    });
  }, [items, debouncedQ, status]);

  const counts = useMemo(() => {
    const active = items.filter((p) => p.isActive).length;
    const draft = items.filter((p) => !p.isActive).length;
    return { all: items.length, active, draft, archived: 0 };
  }, [items]);

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog, pricing, inventory and more."
        actions={
          <>
            <button type="button" className="btn-outline text-sm">
              Import
            </button>
            <Link to="/admin/products/new" className="btn-primary text-sm">
              <IconPlus className="h-4 w-4" />
              Add product
            </Link>
          </>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All products" value={counts.all} icon={<IconPackage className="h-4 w-4" />} />
        <StatCard label="Active" value={counts.active} />
        <StatCard label="Draft" value={counts.draft} />
        <StatCard label="Archived" value={counts.archived} icon={<IconBag className="h-4 w-4" />} />
      </div>

      <div className="panel mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <input
            className="input-field max-w-md flex-1"
            placeholder="Search products by name, SKU or category..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="input-field w-auto" value="all" onChange={() => undefined}>
            <option value="all">All categories</option>
          </select>
          <select className="input-field w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-widest text-muted">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">
                  <input type="checkbox" aria-label="Select all" />
                </th>
                <th className="px-5 py-3 font-medium">Product</th>
                <th className="px-5 py-3 font-medium">SKU</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Price</th>
                <th className="px-5 py-3 font-medium">Stock</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <EmptyState message="No products found." />
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      <input type="checkbox" aria-label={`Select ${p.name}`} />
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/admin/products/${p._id}`} className="flex items-center gap-3 hover:text-[#d4ff3f]">
                        <Thumb src={p.images?.[0]} label={p.name} />
                        <span>
                          <span className="block font-medium">{p.name}</span>
                          <span className="block text-xs text-muted line-clamp-1">{p.description || '—'}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-muted">SKU-{p._id.slice(-4).toUpperCase()}</td>
                    <td className="px-5 py-4">
                      <span className="rounded-full border border-border bg-white/5 px-2.5 py-1 text-xs">Catalog</span>
                    </td>
                    <td className="px-5 py-4 font-medium">{formatINR(p.basePrice)}</td>
                    <td className="px-5 py-4 text-[#d4ff3f]">—</td>
                    <td className="px-5 py-4">
                      <DotStatus label={p.isActive ? 'Active' : 'Draft'} tone={p.isActive ? 'lime' : 'warning'} />
                    </td>
                    <td className="px-5 py-4">
                      <Link to={`/admin/products/${p._id}`} className="text-muted hover:text-text">
                        <IconMore className="h-5 w-5" />
                      </Link>
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
          summary={
            <span className="inline-flex items-center gap-2">
              Showing {filtered.length} of {meta.total || items.length} products
              <DemoBadge />
            </span>
          }
        />
      </div>
    </div>
  );
}
