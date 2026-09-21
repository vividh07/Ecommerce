import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import {
  DotStatus,
  EmptyState,
  PageHeader,
  Pagination,
  StatCard,
  Thumb,
} from '../../components/admin/adminUi';
import { IconChevronRight, IconDownload, IconMore, IconPackage } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

type InventoryRow = {
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  status: 'In' | 'Low' | 'Out' | string;
};

export function InventoryPage() {
  const [items, setItems] = useState<InventoryRow[]>([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [adjustStock, setAdjustStock] = useState(0);
  const debouncedQ = useDebouncedValue(q, 300);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/admin/inventory', {
        params: { page: 1, limit: 100, q: debouncedQ || undefined, status: status || undefined },
      });
      setItems(res.data.items ?? []);
      setMeta(res.data.meta ?? { page: 1, total: 0, totalPages: 1 });
    } catch {
      toast.error('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [debouncedQ, status]);

  const totals = useMemo(() => {
    const onHand = items.reduce((s, r) => s + (r.onHand ?? 0), 0);
    const reserved = items.reduce((s, r) => s + (r.reserved ?? 0), 0);
    return { onHand, reserved, available: onHand - reserved };
  }, [items]);

  const restock = items.filter((r) => r.status === 'Low' || r.status === 'Out').slice(0, 8);

  async function saveAdjust() {
    if (!adjustId) return;
    try {
      await api.patch(`/admin/inventory/${adjustId}`, { stock: adjustStock });
      toast.success('Stock updated');
      setAdjustId(null);
      load();
    } catch {
      toast.error('Could not update stock');
    }
  }

  function statusLabel(s: string) {
    if (s === 'In') return 'In stock';
    if (s === 'Low') return 'Low stock';
    if (s === 'Out') return 'Out of stock';
    return s;
  }

  function statusTone(s: string) {
    if (s === 'In') return 'lime' as const;
    if (s === 'Low') return 'warning' as const;
    return 'danger' as const;
  }

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <PageHeader
        title="Inventory"
        subtitle="Track availability across your catalogue."
        actions={
          <>
            <button type="button" className="btn-outline text-sm">
              <IconDownload className="h-4 w-4" />
              Export
            </button>
            <button
              type="button"
              className="btn-primary text-sm"
              onClick={() => {
                const first = items[0];
                if (!first) return;
                setAdjustId(first.variantId);
                setAdjustStock(first.onHand);
              }}
            >
              <IconPackage className="h-4 w-4" />
              Adjust stock
            </button>
          </>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="On hand" value={totals.onHand} />
        <StatCard label="Reserved" value={totals.reserved} />
        <StatCard label="Available" value={totals.available} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="panel overflow-hidden">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
            <input
              className="input-field max-w-md flex-1"
              placeholder="Search products or SKUs..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <select className="input-field w-auto" defaultValue="all">
              <option value="all">All warehouses</option>
            </select>
            <select className="input-field w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All status</option>
              <option value="In">In stock</option>
              <option value="Low">Low stock</option>
              <option value="Out">Out of stock</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-widest text-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">SKU</th>
                  <th className="px-5 py-3 font-medium">Warehouse</th>
                  <th className="px-5 py-3 font-medium">On hand</th>
                  <th className="px-5 py-3 font-medium">Reserved</th>
                  <th className="px-5 py-3 font-medium">Available</th>
                  <th className="px-5 py-3 font-medium">Reorder point</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      <EmptyState message="No inventory rows yet." />
                    </td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr key={r.variantId} className="border-b border-border last:border-0">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Thumb label={r.name} />
                          <div>
                            <p className="font-medium">{r.name}</p>
                            <p className="text-xs text-muted">Variant</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted">{r.sku}</td>
                      <td className="px-5 py-4 text-muted">Main warehouse</td>
                      <td className="px-5 py-4">{r.onHand}</td>
                      <td className="px-5 py-4">{r.reserved}</td>
                      <td className="px-5 py-4 font-medium">{r.available}</td>
                      <td className="px-5 py-4">{r.reorderPoint}</td>
                      <td className="px-5 py-4">
                        <DotStatus label={statusLabel(r.status)} tone={statusTone(r.status)} />
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          className="text-muted hover:text-text"
                          onClick={() => {
                            setAdjustId(r.variantId);
                            setAdjustStock(r.onHand);
                          }}
                        >
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
            summary={`Showing ${items.length} of ${meta.total || items.length} products`}
          />
        </div>

        <aside className="panel p-5">
          <h2 className="font-semibold">Restock queue</h2>
          <p className="mt-1 text-sm text-muted">Products that need restocking soon.</p>
          <ul className="mt-4 space-y-2">
            {restock.length === 0 ? (
              <li className="py-6 text-sm text-muted">Nothing in the restock queue.</li>
            ) : (
              restock.map((r) => {
                const need = Math.max(0, r.reorderPoint - r.available);
                return (
                  <li key={r.variantId}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-[8px] px-2 py-2 text-left hover:bg-white/5"
                      onClick={() => {
                        setAdjustId(r.variantId);
                        setAdjustStock(r.onHand);
                      }}
                    >
                      <Thumb label={r.name} className="h-9 w-9" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{r.name}</span>
                        <span className="block text-xs text-muted">{r.sku}</span>
                        <span className="block text-xs text-danger">Need {need} more</span>
                        <span className="block text-[11px] text-muted">
                          {r.available} available (min {r.reorderPoint})
                        </span>
                      </span>
                      <IconChevronRight className="h-4 w-4 text-muted" />
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </aside>
      </div>

      {adjustId ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="panel w-full max-w-sm p-5">
            <h3 className="font-semibold">Adjust stock</h3>
            <label className="mt-4 block text-sm">
              <span className="mb-1.5 block text-muted">On hand</span>
              <input
                className="input-field"
                type="number"
                min={0}
                value={adjustStock}
                onChange={(e) => setAdjustStock(Number(e.target.value))}
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="btn-outline text-sm" onClick={() => setAdjustId(null)}>
                Cancel
              </button>
              <button type="button" className="btn-primary text-sm" onClick={saveAdjust}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
