import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
  formatShortDate,
  sellerBtnOutline,
} from '../../components/seller/sellerUi';
import { IconCalendar, IconClock, IconCreditCard, IconDownload } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';

type PayoutRow = {
  id: string;
  date: string;
  amount: number;
  destination?: string;
  status: string;
};

type PayoutsData = {
  availableBalance?: number;
  pendingSettlement?: number;
  paidOut?: number;
  nextPayout?: { amount: number; scheduledFor?: string; bankLabel?: string };
  breakdown?: { gross?: number; fees?: number; refunds?: number; net?: number; periodLabel?: string };
  history?: PayoutRow[];
};

export function PayoutsPage() {
  const [data, setData] = useState<PayoutsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/sellers/payouts');
        if (!cancelled) setData(res.data.data ?? res.data);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status !== 404) toast.error('Failed to load payouts');
        if (!cancelled) {
          setData({
            availableBalance: 0,
            pendingSettlement: 0,
            paidOut: 0,
            history: [],
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Skeleton className="h-96 w-full !bg-[#e5e5e5]" />;

  const history = data?.history ?? [];

  return (
    <div>
      <SellerPageHeader title="Earnings & payouts" subtitle="Track your earnings and upcoming settlements." />

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <SellerStatCard
          label="Available balance"
          value={formatINR(data?.availableBalance ?? 0)}
          sub="Ready to be paid out"
          icon={<IconCreditCard className="h-4 w-4 text-[#16a34a]" />}
        />
        <SellerStatCard
          label="Pending settlement"
          value={formatINR(data?.pendingSettlement ?? 0)}
          sub="From recent orders"
          icon={<IconClock className="h-4 w-4 text-[#ea580c]" />}
        />
        <SellerStatCard
          label="Paid out"
          value={formatINR(data?.paidOut ?? 0)}
          sub="Total sent to your bank"
          icon={<IconCreditCard className="h-4 w-4 text-[#2563eb]" />}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.6fr_1fr]">
        <SellerCard className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e5e5] px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">Payout history</h2>
              <p className="text-xs text-[#6b7280]">View all your settlements and payouts.</p>
            </div>
            <button type="button" className={sellerBtnOutline('!py-2 text-xs')}>
              <IconDownload className="h-3.5 w-3.5" />
              Export statement
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-widest text-[#9ca3af]">
                <tr className="border-b border-[#e5e5e5]">
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Payout ID</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Destination</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6}>
                      <SellerEmptyState message="No payouts yet." />
                    </td>
                  </tr>
                ) : (
                  history.map((row) => (
                    <tr key={row.id} className="border-b border-[#f0f0f0] last:border-0">
                      <td className="px-5 py-3.5 text-[#6b7280]">{formatShortDate(row.date)}</td>
                      <td className="px-5 py-3.5 font-medium">{row.id}</td>
                      <td className="px-5 py-3.5">{formatINR(row.amount)}</td>
                      <td className="px-5 py-3.5 text-[#6b7280]">{row.destination ?? '—'}</td>
                      <td className="px-5 py-3.5">
                        <SellerPill tone={row.status.toLowerCase().includes('paid') ? 'success' : 'warning'}>
                          {row.status}
                        </SellerPill>
                      </td>
                      <td className="px-5 py-3.5">
                        <button type="button" className="text-[#6b7280]" aria-label="Download receipt">
                          <IconDownload className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <p className="border-t border-[#e5e5e5] px-5 py-3 text-sm text-[#6b7280]">
            Showing 1–{history.length} of {history.length} payouts
          </p>
        </SellerCard>

        <div className="space-y-5">
          <SellerCard className="p-5">
            <div className="flex items-center gap-2 text-sm text-[#6b7280]">
              <IconCalendar className="h-4 w-4 text-[#16a34a]" />
              Next payout
            </div>
            <p className="mt-2 text-2xl font-semibold">{formatINR(data?.nextPayout?.amount ?? data?.availableBalance ?? 0)}</p>
            <p className="mt-1 text-sm text-[#6b7280]">
              {data?.nextPayout?.scheduledFor
                ? `Scheduled for ${formatShortDate(data.nextPayout.scheduledFor)}`
                : 'No payout scheduled'}
            </p>
            <p className="mt-2 text-sm text-[#6b7280]">{data?.nextPayout?.bankLabel ?? 'Add a payout account'}</p>
            <Link to="/seller/settings" className="mt-3 inline-block text-sm text-[#2563eb] hover:underline">
              Manage account →
            </Link>
          </SellerCard>

          <SellerCard className="p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">Settlement breakdown</h3>
              <SellerDemoBadge />
            </div>
            <p className="mt-1 text-xs text-[#6b7280]">{data?.breakdown?.periodLabel ?? 'Recent orders'}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-[#6b7280]">Gross sales</dt>
                <dd>{formatINR(data?.breakdown?.gross ?? 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6b7280]">Platform fees</dt>
                <dd className="text-[#dc2626]">−{formatINR(data?.breakdown?.fees ?? 0)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[#6b7280]">Refunds</dt>
                <dd className="text-[#dc2626]">−{formatINR(data?.breakdown?.refunds ?? 0)}</dd>
              </div>
              <div className="flex justify-between border-t border-[#e5e5e5] pt-2 font-semibold">
                <dt>Net earnings</dt>
                <dd>{formatINR(data?.breakdown?.net ?? data?.availableBalance ?? 0)}</dd>
              </div>
            </dl>
            <p className="mt-4 rounded-[8px] bg-[#f5f5f5] px-3 py-2 text-[11px] text-[#6b7280]">
              Figures may include demo data until settlements are available.
            </p>
          </SellerCard>
        </div>
      </div>
    </div>
  );
}
