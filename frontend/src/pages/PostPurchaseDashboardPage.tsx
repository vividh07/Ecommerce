import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Skeleton } from '../components/ui/Skeleton';

type DashItem = {
  type: string;
  urgency: number;
  title: string;
  subtitle: string;
  daysLeft: number | null;
  orderId: string;
  orderStatus?: string;
};

type Filter = 'all' | 'deliveries' | 'returns' | 'warranties' | 'replacements';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'deliveries', label: 'Deliveries' },
  { id: 'returns', label: 'Returns' },
  { id: 'warranties', label: 'Warranties' },
  { id: 'replacements', label: 'Replacements' },
];

export function PostPurchaseDashboardPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [items, setItems] = useState<DashItem[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get('/dashboard/post-purchase', { params: { filter } })
      .then((res) => {
        setItems(res.data.data.items ?? []);
        setSummary(res.data.data.summary ?? {});
      })
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold">Post-purchase hub</h1>
        <p className="mt-2 text-muted">
          Deliveries, return windows, warranties, and replacements — sorted by what needs attention first.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { key: 'activeDeliveries', label: 'In transit', color: 'text-accent' },
          { key: 'returnWindows', label: 'Returns', color: 'text-amber-300' },
          { key: 'warrantyAlerts', label: 'Warranties', color: 'text-accent-2' },
          { key: 'replacementReminders', label: 'Replacements', color: 'text-success' },
        ].map((s) => (
          <div key={s.key} className="glass rounded-2xl p-4 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{summary[s.key] ?? 0}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-2 text-sm transition ${
              filter === f.id ? 'bg-accent/20 text-accent' : 'bg-white/5 text-muted hover:text-text'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <p className="text-muted">Nothing in this view yet. Completed deliveries will show return and warranty timelines here.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, idx) => {
            const urgent = item.daysLeft != null && item.daysLeft <= 3;
            return (
              <motion.li
                key={`${item.type}-${item.orderId}-${idx}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-5 ${
                  urgent ? 'ring-1 ring-danger/50' : ''
                }`}
              >
                <div>
                  <span className="text-xs uppercase tracking-wide text-muted">{item.type}</span>
                  <p className="font-medium">{item.title}</p>
                  <p className={`text-sm ${urgent ? 'text-danger' : 'text-muted'}`}>{item.subtitle}</p>
                </div>
                <Link to={`/orders/${item.orderId}`} className="btn-ghost text-sm">
                  View order
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
