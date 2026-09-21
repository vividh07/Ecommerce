import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import type { Product } from '../../types';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  SellerCard,
  SellerDotStatus,
  SellerEmptyState,
  SellerPageHeader,
  SellerPagination,
  SellerPill,
  SellerStatCard,
  SellerThumb,
  formatShortDate,
  sellerBtnOutline,
  sellerBtnPrimary,
  sellerInputClass,
} from '../../components/seller/sellerUi';
import { IconClose, IconExternal, IconMore, IconPackage, IconPlus } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';

type SellerProduct = Product & {
  sku?: string;
  stock?: number;
  categoryName?: string;
  variants?: Array<{ sku: string; stock: number; price: number }>;
  createdAt?: string;
  updatedAt?: string;
};

function productStatus(p: SellerProduct) {
  const stock = p.stock ?? p.variants?.reduce((s, v) => s + (v.stock ?? 0), 0) ?? 0;
  if (!p.isActive) return { label: 'Draft', tone: 'neutral' as const };
  if (stock <= 0) return { label: 'Out of stock', tone: 'danger' as const };
  return { label: 'Active', tone: 'success' as const };
}

export function ProductsPage() {
  const [items, setItems] = useState<SellerProduct[]>([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stats, setStats] = useState<{ all: number; active: number; draft: number; outOfStock: number } | null>(
    null
  );
  const debouncedQ = useDebouncedValue(q, 300);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        try {
          const statsRes = await api.get('/sellers/product-stats');
          if (!cancelled && statsRes.data.data) setStats(statsRes.data.data);
        } catch {
          /* optional */
        }

        const res = await api.get('/products/mine', { params: { page: 1, limit: 100 } });
        if (!cancelled) {
          const list: SellerProduct[] = (res.data.items ?? []).map((p: SellerProduct) => ({
            ...p,
            sku: p.sku ?? p.variants?.[0]?.sku ?? `SKU-${String(p._id).slice(-4).toUpperCase()}`,
            stock: p.stock ?? p.variants?.reduce((s, v) => s + (v.stock ?? 0), 0) ?? 0,
            categoryName: p.categoryName ?? '—',
          }));
          setItems(list);
          setMeta(res.data.meta ?? { page: 1, total: list.length, totalPages: 1 });
          if (!selectedId && list[0]) setSelectedId(list[0]._id);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const needle = debouncedQ.trim().toLowerCase();
    return items.filter((p) => {
      const st = productStatus(p);
      if (status === 'active' && st.label !== 'Active') return false;
      if (status === 'draft' && st.label !== 'Draft') return false;
      if (status === 'oos' && st.label !== 'Out of stock') return false;
      if (!needle) return true;
      return (
        p.name.toLowerCase().includes(needle) ||
        (p.sku ?? '').toLowerCase().includes(needle) ||
        (p.description ?? '').toLowerCase().includes(needle)
      );
    });
  }, [items, debouncedQ, status]);

  const counts = useMemo(() => {
    if (stats) return stats;
    const active = items.filter((p) => productStatus(p).label === 'Active').length;
    const draft = items.filter((p) => productStatus(p).label === 'Draft').length;
    const outOfStock = items.filter((p) => productStatus(p).label === 'Out of stock').length;
    return { all: items.length, active, draft, outOfStock };
  }, [items, stats]);

  const selected = items.find((p) => p._id === selectedId) ?? null;

  if (loading) return <Skeleton className="h-96 w-full !bg-[#e5e5e5]" />;

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div className="min-w-0 flex-1">
        <SellerPageHeader
          title="Products"
          subtitle="Manage your catalog, pricing and availability."
          actions={
            <Link to="/seller/products/new" className={sellerBtnPrimary()}>
              <IconPlus className="h-4 w-4" />
              Add product
            </Link>
          }
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SellerStatCard label="All products" value={counts.all} icon={<IconPackage className="h-4 w-4" />} />
          <SellerStatCard label="Active" value={counts.active} sub={<SellerDotStatus label="Live" tone="success" />} />
          <SellerStatCard label="Draft" value={counts.draft} sub={<SellerDotStatus label="Hidden" tone="neutral" />} />
          <SellerStatCard
            label="Out of stock"
            value={counts.outOfStock}
            warn={counts.outOfStock > 0}
            sub={<SellerDotStatus label="Restock" tone="danger" />}
          />
        </div>

        <SellerCard className="mt-6 overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#e5e5e5] px-5 py-4">
            <input
              className={sellerInputClass('max-w-md flex-1')}
              placeholder="Search products..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className={sellerInputClass('w-auto')} defaultValue="all">
              <option value="all">All categories</option>
            </select>
            <select className={sellerInputClass('w-auto')} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="oos">Out of stock</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-widest text-[#9ca3af]">
                <tr className="border-b border-[#e5e5e5]">
                  <th className="px-5 py-3 font-medium">
                    <input type="checkbox" aria-label="Select all" />
                  </th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <SellerEmptyState message="No products found." />
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => {
                    const st = productStatus(p);
                    const selectedRow = selectedId === p._id;
                    return (
                      <tr
                        key={p._id}
                        onClick={() => setSelectedId(p._id)}
                        className={`cursor-pointer border-b border-[#f0f0f0] last:border-0 ${
                          selectedRow ? 'bg-[#f7ffe0]' : 'hover:bg-[#fafafa]'
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <input
                            type="checkbox"
                            checked={selectedRow}
                            onChange={() => setSelectedId(p._id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <SellerThumb src={p.images?.[0]} label={p.name} />
                            <div className="min-w-0">
                              <p className="font-medium">{p.name}</p>
                              <p className="truncate text-xs text-[#6b7280] max-w-[220px]">
                                {(p.description ?? '').slice(0, 60) || '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[#6b7280]">{p.sku}</td>
                        <td className="px-5 py-3.5">{p.categoryName}</td>
                        <td className="px-5 py-3.5">{p.stock ?? 0}</td>
                        <td className="px-5 py-3.5 font-medium">{formatINR(p.basePrice)}</td>
                        <td className="px-5 py-3.5">
                          <SellerDotStatus label={st.label} tone={st.tone} />
                        </td>
                        <td className="px-5 py-3.5">
                          <button type="button" className="text-[#9ca3af]" aria-label="More">
                            <IconMore className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <SellerPagination
            page={meta.page}
            totalPages={meta.totalPages}
            summary={
              selectedId
                ? `1 product selected · ${filtered.length} shown`
                : `1–${filtered.length} of ${meta.total || items.length}`
            }
          />
        </SellerCard>
      </div>

      {selected ? (
        <aside className="w-full shrink-0 xl:w-[340px]">
          <SellerCard className="sticky top-4 overflow-hidden p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-[#6b7280]">Product selected</p>
                <h3 className="mt-1 text-lg font-semibold">{selected.name}</h3>
                <div className="mt-2">
                  <SellerPill tone={productStatus(selected).tone === 'success' ? 'success' : productStatus(selected).tone}>
                    {productStatus(selected).label}
                  </SellerPill>
                </div>
              </div>
              <button type="button" className="text-[#9ca3af]" onClick={() => setSelectedId(null)} aria-label="Close">
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4">
              <SellerThumb src={selected.images?.[0]} label={selected.name} className="h-40 w-full" />
              {selected.images && selected.images.length > 1 ? (
                <div className="mt-2 flex gap-2">
                  {selected.images.slice(0, 4).map((src, i) => (
                    <SellerThumb
                      key={src + i}
                      src={src}
                      className={`h-12 w-12 ${i === 0 ? 'ring-2 ring-[#d4ff3f]' : ''}`}
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <dl className="mt-5 space-y-2.5 text-sm">
              {[
                ['SKU', selected.sku ?? '—'],
                ['Category', selected.categoryName ?? '—'],
                ['Price', formatINR(selected.basePrice)],
                ['Stock', `${selected.stock ?? 0} units`],
                ['Added on', formatShortDate(selected.createdAt)],
                ['Last updated', formatShortDate(selected.updatedAt)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-[#6b7280]">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 border-t border-[#e5e5e5] pt-4">
              <p className="text-sm font-medium">Product description</p>
              <p className="mt-2 text-sm leading-relaxed text-[#6b7280]">
                {(selected.description || 'No description yet.').slice(0, 180)}
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <Link to={`/seller/products/${selected._id}`} className={sellerBtnPrimary('w-full')}>
                Edit product
              </Link>
              <Link to={`/product/${selected._id}`} className={sellerBtnOutline('w-full')}>
                Preview
                <IconExternal className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="mt-4 rounded-[8px] bg-[#eff6ff] px-3 py-2 text-[11px] text-[#1d4ed8]">
              Demo data — for illustration purposes only.
            </p>
          </SellerCard>
        </aside>
      ) : null}
    </div>
  );
}
