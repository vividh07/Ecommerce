import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import type { Coupon } from '../../types';
import {
  DotStatus,
  EmptyState,
  PageHeader,
  Pagination,
  Thumb,
  formatShortDate,
} from '../../components/admin/adminUi';
import { IconClose, IconMore, IconPlus } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

type Draft = {
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number;
  minOrderValue: number;
  usageLimit: number | '';
  expiryDate: string;
};

const emptyDraft: Draft = {
  code: '',
  type: 'PERCENTAGE',
  value: 10,
  minOrderValue: 0,
  usageLimit: 100,
  expiryDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
};

function couponStatus(c: Coupon) {
  const now = Date.now();
  const exp = new Date(c.expiryDate).getTime();
  if (!c.isActive || exp < now) return { label: 'Expired', tone: 'danger' as const };
  return { label: 'Active', tone: 'lime' as const };
}

export function DiscountsPage() {
  const [items, setItems] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const debouncedQ = useDebouncedValue(q, 300);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/coupons/admin');
      setItems(res.data.items ?? res.data.data ?? []);
    } catch {
      toast.error('Failed to load discounts');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = debouncedQ.trim().toLowerCase();
    return items.filter((c) => {
      const st = couponStatus(c).label.toLowerCase();
      if (tab === 'active' && st !== 'active') return false;
      if (tab === 'expired' && st !== 'expired') return false;
      if (tab === 'scheduled') return false;
      if (!needle) return true;
      return c.code.toLowerCase().includes(needle);
    });
  }, [items, tab, debouncedQ]);

  async function createDiscount() {
    try {
      await api.post('/coupons/admin', {
        code: draft.code.trim().toUpperCase(),
        type: draft.type,
        value: Number(draft.value),
        minOrderValue: Number(draft.minOrderValue) || 0,
        usageLimit: draft.usageLimit === '' ? null : Number(draft.usageLimit),
        expiryDate: draft.expiryDate,
      });
      toast.success('Discount created');
      setDrawerOpen(false);
      setDraft(emptyDraft);
      load();
    } catch {
      toast.error('Could not create discount');
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="relative">
      <PageHeader
        title="Discounts"
        subtitle="Create and manage discount codes to boost sales and reward your customers."
        actions={
          <button
            type="button"
            className="btn-primary text-sm"
            onClick={() => {
              setDraft(emptyDraft);
              setDrawerOpen(true);
            }}
          >
            <IconPlus className="h-4 w-4" />
            Create discount
          </button>
        }
      />

      <div className="panel mt-8 overflow-hidden">
        <div className="flex flex-wrap gap-4 border-b border-border px-5 pt-4">
          {[
            { id: 'all', label: 'All' },
            { id: 'active', label: 'Active' },
            { id: 'scheduled', label: 'Scheduled' },
            { id: 'expired', label: 'Expired' },
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
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <input
            className="input-field max-w-md flex-1"
            placeholder="Search discounts by code or name..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className="input-field w-auto" defaultValue="all">
            <option value="all">All types</option>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-widest text-muted">
              <tr className="border-b border-border">
                <th className="px-5 py-3 font-medium">Discount</th>
                <th className="px-5 py-3 font-medium">Type</th>
                <th className="px-5 py-3 font-medium">Terms</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Redemptions</th>
                <th className="px-5 py-3 font-medium">End date</th>
                <th className="px-5 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState message="No discount codes yet." />
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const st = couponStatus(c);
                  return (
                    <tr key={c._id} className="border-b border-border last:border-0">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Thumb label={c.code} />
                          <div>
                            <p className="font-medium">{c.code}</p>
                            <p className="text-xs text-muted">
                              {c.type === 'PERCENTAGE' ? `${c.value}% off` : `${formatINR(c.value)} off`}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted">{c.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed amount'}</td>
                      <td className="px-5 py-4 text-muted">
                        Min order {formatINR(c.minOrderValue ?? 0)}
                      </td>
                      <td className="px-5 py-4">
                        <DotStatus label={st.label} tone={st.tone} />
                      </td>
                      <td className="px-5 py-4">
                        {c.timesUsed}
                        {c.usageLimit != null ? ` / ${c.usageLimit}` : ''}
                      </td>
                      <td className="px-5 py-4 text-muted">{formatShortDate(c.expiryDate)}</td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          className="text-muted hover:text-text"
                          onClick={async () => {
                            await api.patch(`/coupons/${c._id}`, { isActive: !c.isActive });
                            load();
                          }}
                        >
                          <IconMore className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={1}
          totalPages={1}
          summary={`Showing ${filtered.length} of ${items.length} discounts`}
        />
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/50">
          <div className="flex h-full w-full max-w-md flex-col border-l border-border bg-bg">
            <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
              <div>
                <h2 className="text-lg font-semibold">Create discount</h2>
                <p className="mt-1 text-sm text-muted">Set up a new discount code for your store.</p>
              </div>
              <button type="button" className="text-muted hover:text-text" onClick={() => setDrawerOpen(false)}>
                <IconClose className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Discount code</span>
                <input
                  className="input-field"
                  value={draft.code}
                  onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value.toUpperCase() }))}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Discount type</span>
                <select
                  className="input-field"
                  value={draft.type}
                  onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as Draft['type'] }))}
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed amount</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Discount value</span>
                <div className="relative">
                  <input
                    className="input-field pr-10"
                    type="number"
                    min={0}
                    value={draft.value}
                    onChange={(e) => setDraft((d) => ({ ...d, value: Number(e.target.value) }))}
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                    {draft.type === 'PERCENTAGE' ? '%' : 'INR'}
                  </span>
                </div>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Minimum order amount</span>
                <input
                  className="input-field"
                  type="number"
                  min={0}
                  value={draft.minOrderValue}
                  onChange={(e) => setDraft((d) => ({ ...d, minOrderValue: Number(e.target.value) }))}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Total usage limit</span>
                <input
                  className="input-field"
                  type="number"
                  min={1}
                  value={draft.usageLimit}
                  onChange={(e) =>
                    setDraft((d) => ({
                      ...d,
                      usageLimit: e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">End date</span>
                <input
                  className="input-field"
                  type="date"
                  value={draft.expiryDate}
                  onChange={(e) => setDraft((d) => ({ ...d, expiryDate: e.target.value }))}
                />
              </label>
            </div>
            <div className="flex gap-2 border-t border-border px-5 py-4">
              <button type="button" className="btn-outline flex-1 text-sm" onClick={() => setDrawerOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn-primary flex-1 text-sm" onClick={createDiscount}>
                Save discount
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
