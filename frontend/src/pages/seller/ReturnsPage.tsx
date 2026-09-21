import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import {
  SellerCard,
  SellerDemoBadge,
  SellerEmptyState,
  SellerPageHeader,
  SellerPill,
  SellerStatCard,
  SellerThumb,
  formatShortDate,
  sellerBtnOutline,
  sellerBtnPrimary,
  sellerInputClass,
} from '../../components/seller/sellerUi';
import { IconCheck, IconClose, IconDocument, IconTruck } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';

type ReturnRow = {
  returnId: string;
  orderId: string;
  orderNumber?: string;
  productName: string;
  variantLabel?: string;
  reason?: string;
  note?: string;
  image?: string;
  price?: number;
  customer?: { name?: string; email?: string } | null;
  requestedAt: string;
  status: string;
  refundAmount?: number;
  evidence?: string[];
};

function statusMeta(status: string) {
  const s = status.toUpperCase();
  if (s === 'REFUNDED' || s === 'COMPLETED') return { label: 'Refunded', tone: 'success' as const, tab: 'completed' };
  if (s === 'IN_TRANSIT' || s === 'RETURNED') return { label: 'In transit', tone: 'info' as const, tab: 'transit' };
  return { label: 'Under review', tone: 'warning' as const, tab: 'review' };
}

export function ReturnsPage() {
  const [items, setItems] = useState<ReturnRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/sellers/returns', { params: { page: 1, limit: 50 } });
        if (!cancelled) {
          const list: ReturnRow[] = res.data.items ?? [];
          setItems(list);
          if (list[0]) setSelectedId(list[0].returnId);
        }
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status !== 404) toast.error('Failed to load returns');
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const counts = useMemo(() => {
    const review = items.filter((r) => statusMeta(r.status).tab === 'review').length;
    const transit = items.filter((r) => statusMeta(r.status).tab === 'transit').length;
    const completed = items.filter((r) => statusMeta(r.status).tab === 'completed').length;
    return {
      requested: items.length,
      awaiting: transit,
      refunded: completed,
      review,
      transit,
      completed,
    };
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((r) => {
      if (tab === 'review' && statusMeta(r.status).tab !== 'review') return false;
      if (tab === 'transit' && statusMeta(r.status).tab !== 'transit') return false;
      if (tab === 'completed' && statusMeta(r.status).tab !== 'completed') return false;
      if (!needle) return true;
      return (
        r.productName.toLowerCase().includes(needle) ||
        r.returnId.toLowerCase().includes(needle) ||
        (r.customer?.name ?? '').toLowerCase().includes(needle)
      );
    });
  }, [items, tab, q]);

  const selected = items.find((r) => r.returnId === selectedId) ?? null;

  if (loading) return <Skeleton className="h-96 w-full !bg-[#e5e5e5]" />;

  const timeline = ['Requested', 'Under review', 'Return received', 'Refunded'];
  const activeStep =
    selected && statusMeta(selected.status).tab === 'completed'
      ? 3
      : selected && statusMeta(selected.status).tab === 'transit'
        ? 2
        : 1;

  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div className="min-w-0 flex-1">
        <SellerPageHeader
          title="Returns & refunds"
          subtitle="Review requests and keep customers informed."
          badge={<SellerDemoBadge />}
        />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <SellerStatCard label="Requested" value={counts.requested} icon={<IconDocument className="h-4 w-4" />} />
          <SellerStatCard label="Awaiting receipt" value={counts.awaiting} icon={<IconTruck className="h-4 w-4" />} />
          <SellerStatCard label="Refunded" value={counts.refunded} icon={<IconCheck className="h-4 w-4" />} />
        </div>

        <div className="mt-5 flex flex-wrap gap-4 border-b border-[#e5e5e5]">
          {[
            { id: 'all', label: `All (${items.length})` },
            { id: 'review', label: `Needs review (${counts.review})` },
            { id: 'transit', label: `In transit (${counts.transit})` },
            { id: 'completed', label: `Completed (${counts.completed})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`border-b-2 pb-3 text-sm ${
                tab === t.id ? 'border-[#d4ff3f] font-medium text-[#111]' : 'border-transparent text-[#6b7280]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <input
            className={sellerInputClass('max-w-sm flex-1')}
            placeholder="Search returns..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <select className={sellerInputClass('w-auto')}>
            <option>Newest first</option>
          </select>
        </div>

        <SellerCard className="mt-4 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-widest text-[#9ca3af]">
                <tr className="border-b border-[#e5e5e5]">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Return ID</th>
                  <th className="px-5 py-3 font-medium">Original order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Reason</th>
                  <th className="px-5 py-3 font-medium">Requested</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <SellerEmptyState message="No return requests yet." />
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => {
                    const meta = statusMeta(r.status);
                    const selectedRow = selectedId === r.returnId;
                    return (
                      <tr
                        key={r.returnId}
                        onClick={() => setSelectedId(r.returnId)}
                        className={`cursor-pointer border-b border-[#f0f0f0] last:border-0 ${
                          selectedRow ? 'bg-[#f7ffe0]' : 'hover:bg-[#fafafa]'
                        }`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <SellerThumb src={r.image} label={r.productName} />
                            <div>
                              <p className="font-medium">{r.productName}</p>
                              <p className="text-xs text-[#6b7280]">{r.variantLabel ?? '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 font-medium">#{r.returnId}</td>
                        <td className="px-5 py-3.5 text-[#6b7280]">#{r.orderNumber ?? r.orderId.slice(-6)}</td>
                        <td className="px-5 py-3.5">{r.customer?.name ?? '—'}</td>
                        <td className="px-5 py-3.5">{r.reason ?? '—'}</td>
                        <td className="px-5 py-3.5 text-[#6b7280]">{formatShortDate(r.requestedAt)}</td>
                        <td className="px-5 py-3.5">
                          <SellerPill tone={meta.tone}>{meta.label}</SellerPill>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </SellerCard>
      </div>

      {selected ? (
        <aside className="w-full shrink-0 xl:w-[360px]">
          <SellerCard className="sticky top-4 p-5">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">Return #{selected.returnId}</h3>
                  <SellerPill tone={statusMeta(selected.status).tone}>{statusMeta(selected.status).label}</SellerPill>
                </div>
              </div>
              <button type="button" className="text-[#9ca3af]" onClick={() => setSelectedId(null)} aria-label="Close">
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center gap-3">
              <SellerThumb src={selected.image} label={selected.productName} className="h-14 w-14" />
              <div>
                <p className="font-medium">{selected.productName}</p>
                <p className="text-sm text-[#6b7280]">
                  {selected.variantLabel ?? 'Default'}
                  {selected.price != null ? ` · ${formatINR(selected.price)}` : null}
                </p>
              </div>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-[#6b7280]">Customer</dt>
                <dd className="font-medium">{selected.customer?.name ?? '—'}</dd>
                <dd className="text-xs text-[#6b7280]">{selected.customer?.email}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">Original order</dt>
                <dd className="font-medium">#{selected.orderNumber ?? selected.orderId.slice(-6)}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">Reason for return</dt>
                <dd className="font-medium">{selected.reason ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-[#6b7280]">Requested on</dt>
                <dd className="font-medium">{formatShortDate(selected.requestedAt)}</dd>
              </div>
            </dl>

            {selected.note ? (
              <div className="mt-4">
                <p className="text-sm text-[#6b7280]">Customer note</p>
                <p className="mt-1 text-sm">{selected.note}</p>
              </div>
            ) : null}

            <div className="mt-5">
              <p className="text-sm font-medium">Return timeline</p>
              <ol className="mt-3 space-y-3">
                {timeline.map((label, i) => (
                  <li key={label} className="flex items-center gap-3 text-sm">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full ${
                        i < activeStep
                          ? 'bg-[#111] text-white'
                          : i === activeStep
                            ? 'bg-[#d4ff3f] text-[#111]'
                            : 'border border-[#d4d4d4] text-transparent'
                      }`}
                    >
                      {i <= activeStep ? <IconCheck className="h-3 w-3" /> : '·'}
                    </span>
                    <span className={i <= activeStep ? 'font-medium' : 'text-[#9ca3af]'}>{label}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-5 space-y-2">
              <button type="button" className={sellerBtnPrimary('w-full')}>
                Approve return
              </button>
              <button type="button" className={sellerBtnOutline('w-full')}>
                Request details
              </button>
            </div>
            <p className="mt-3 text-[11px] text-[#6b7280]">Approving the return does not issue a refund.</p>
          </SellerCard>
        </aside>
      ) : null}
    </div>
  );
}
