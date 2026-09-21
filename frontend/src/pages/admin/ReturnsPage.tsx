import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import {
  DotStatus,
  EmptyState,
  PageHeader,
  Pagination,
  StatCard,
  Thumb,
  formatShortDate,
} from '../../components/admin/adminUi';
import { IconClose } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';

type ReturnRow = {
  returnId: string;
  orderId: string;
  orderNumber?: string;
  productName: string;
  customer?: { _id: string; name: string; email: string } | null;
  requestedAt: string;
  status: string;
  refundAmount: number;
};

export function ReturnsPage() {
  const [items, setItems] = useState<ReturnRow[]>([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/returns', { params: { page: 1, limit: 50 } });
        if (!cancelled) {
          const list = res.data.items ?? [];
          setItems(list);
          setMeta(res.data.meta ?? { page: 1, total: 0, totalPages: 1 });
          if (list[0]) setSelectedId(list[0].returnId);
        }
      } catch {
        toast.error('Failed to load returns');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = items.find((r) => r.returnId === selectedId) ?? null;

  const counts = useMemo(() => {
    const refunded = items.filter((r) => r.status === 'REFUNDED').length;
    const returned = items.filter((r) => r.status === 'RETURNED').length;
    return {
      awaiting: returned,
      receipt: 0,
      refunded,
      all: meta.total || items.length,
    };
  }, [items, meta.total]);

  const filtered = useMemo(() => {
    if (tab === 'refunded') return items.filter((r) => r.status === 'REFUNDED');
    if (tab === 'requested') return items.filter((r) => r.status === 'RETURNED');
    return items;
  }, [items, tab]);

  function statusTone(status: string) {
    if (status === 'REFUNDED') return 'lime' as const;
    if (status === 'RETURNED') return 'warning' as const;
    return 'neutral' as const;
  }

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <PageHeader title="Returns & refunds" subtitle="Review requests and track returned items." />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Awaiting review" value={counts.awaiting} />
        <StatCard label="Awaiting receipt" value={counts.receipt} />
        <StatCard label="Refunded" value={counts.refunded} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="panel overflow-hidden">
          <div className="flex flex-wrap gap-4 border-b border-border px-5 pt-4">
            {[
              { id: 'all', label: `All (${counts.all})` },
              { id: 'requested', label: `Requested (${counts.awaiting})` },
              { id: 'approved', label: 'Approved (0)' },
              { id: 'received', label: 'Received (0)' },
              { id: 'refunded', label: `Refunded (${counts.refunded})` },
              { id: 'rejected', label: 'Rejected (0)' },
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

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-widest text-muted">
                <tr className="border-b border-border">
                  <th className="px-5 py-3 font-medium">
                    <input type="checkbox" aria-label="Select all" />
                  </th>
                  <th className="px-5 py-3 font-medium">Return #</th>
                  <th className="px-5 py-3 font-medium">Order #</th>
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Requested</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Refund amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <EmptyState message="No returns yet." />
                    </td>
                  </tr>
                ) : (
                  filtered.map((r) => (
                    <tr
                      key={r.returnId}
                      onClick={() => setSelectedId(r.returnId)}
                      className={`cursor-pointer border-b border-border last:border-0 ${
                        selectedId === r.returnId ? 'bg-white/[0.03]' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selectedId === r.returnId}
                          onChange={() => setSelectedId(r.returnId)}
                          aria-label={`Select ${r.returnId}`}
                        />
                      </td>
                      <td className="px-5 py-4 font-medium">{r.returnId}</td>
                      <td className="px-5 py-4 text-muted">{r.orderNumber}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Thumb label={r.productName} />
                          <span className="font-medium">{r.productName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted">{r.customer?.name ?? '—'}</td>
                      <td className="px-5 py-4 text-muted">{formatShortDate(r.requestedAt)}</td>
                      <td className="px-5 py-4">
                        <DotStatus
                          label={r.status === 'REFUNDED' ? 'Refunded' : 'Requested'}
                          tone={statusTone(r.status)}
                        />
                      </td>
                      <td className="px-5 py-4 font-medium">{formatINR(r.refundAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages || 1}
            summary={`Showing ${filtered.length} of ${meta.total || items.length} returns`}
          />
        </div>

        <aside className="panel overflow-hidden">
          {selected ? (
            <>
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-semibold">Return #{selected.returnId}</h2>
                <button type="button" className="text-muted hover:text-text" onClick={() => setSelectedId(null)}>
                  <IconClose className="h-4 w-4" />
                </button>
              </div>
              <div className="border-b border-border px-5 py-4">
                <div className="flex items-center gap-3 rounded-[10px] border border-border p-3">
                  <Thumb label={selected.productName} className="h-14 w-14" />
                  <div>
                    <p className="font-medium">{selected.productName}</p>
                    <p className="text-xs text-muted">Order {selected.orderNumber}</p>
                    <p className="mt-1 text-sm">{formatINR(selected.refundAmount)}</p>
                  </div>
                </div>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Customer</dt>
                    <dd>{selected.customer?.name ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Email</dt>
                    <dd className="truncate">{selected.customer?.email ?? '—'}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Requested on</dt>
                    <dd>{formatShortDate(selected.requestedAt)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Requested refund</dt>
                    <dd>{formatINR(selected.refundAmount)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">Condition</dt>
                    <dd>Not inspected</dd>
                  </div>
                </dl>
              </div>
              <div className="border-b border-border px-5 py-4">
                <p className="text-sm text-muted">Customer note</p>
                <p className="mt-2 rounded-[8px] border border-border bg-panel-2 p-3 text-sm">
                  Return request recorded for this order.
                </p>
                <div className="mt-4 flex gap-2">
                  <button type="button" className="btn-outline flex-1 text-sm text-danger">
                    Reject
                  </button>
                  <button type="button" className="btn-primary flex-1 text-sm" onClick={() => toast.success('Marked reviewed')}>
                    Approve return
                  </button>
                </div>
                <p className="mt-2 text-[11px] text-muted">
                  Approval authorizes return; refund is issued after inspection.
                </p>
              </div>
              <div className="px-5 py-4">
                <p className="font-semibold">Return timeline</p>
                <ol className="mt-4 space-y-4 text-sm">
                  <li className="flex gap-3">
                    <span className="mt-1 h-3 w-3 rounded-full bg-[#d4ff3f]" />
                    <div>
                      <p className="font-medium">Requested</p>
                      <p className="text-xs text-muted">{formatShortDate(selected.requestedAt)}</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-3 w-3 rounded-full border border-warning" />
                    <div>
                      <p className="font-medium">Awaiting review</p>
                      <p className="text-xs text-muted">Pending admin action</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-3 w-3 rounded-full border border-muted" />
                    <div>
                      <p className="font-medium text-muted">Awaiting receipt</p>
                    </div>
                  </li>
                </ol>
              </div>
            </>
          ) : (
            <div className="px-5 py-12 text-center text-sm text-muted">Select a return to view details.</div>
          )}
        </aside>
      </div>
    </div>
  );
}
