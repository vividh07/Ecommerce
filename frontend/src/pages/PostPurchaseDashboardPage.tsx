import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { AccountSidebar } from '../components/layout/AccountSidebar';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { Skeleton } from '../components/ui/Skeleton';

type Filter = 'all' | 'deliveries' | 'returns' | 'warranties' | 'replacements';

export function PostPurchaseDashboardPage() {
  const [filter, setFilter] = useState<Filter>('all');
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/dashboard/post-purchase', { params: { filter } }).then((res) => {
      setItems(res.data.data.items ?? []);
      setSummary(res.data.data.summary ?? {});
    }).finally(() => setLoading(false));
  }, [filter]);

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'deliveries', label: 'Deliveries' },
    { id: 'returns', label: 'Returns' },
    { id: 'warranties', label: 'Warranties' },
  ];

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <AccountSidebar />
      <div>
        <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'DASHBOARD' }]} />
        <h1 className="page-title mt-4">After purchase.</h1>
        <p className="mt-2 text-muted">Deadlines and deliveries sorted by urgency.</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-4">
          {[
            { k: 'activeDeliveries', l: 'In transit' },
            { k: 'returnWindows', l: 'Returns' },
            { k: 'warrantyAlerts', l: 'Warranties' },
            { k: 'replacementReminders', l: 'Replacements' },
          ].map((s) => (
            <div key={s.k} className="card p-4 text-center">
              <p className="text-2xl font-bold text-accent">{summary[s.k] ?? 0}</p>
              <p className="text-xs text-muted">{s.l}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button key={f.id} type="button" onClick={() => setFilter(f.id)} className={`rounded-full px-4 py-2 text-sm ${filter === f.id ? 'bg-accent text-accent-fg' : 'border border-border text-muted'}`}>
              {f.label}
            </button>
          ))}
        </div>
        {loading ? <Skeleton className="mt-8 h-48" /> : (
          <ul className="mt-8 space-y-3">
            {items.map((item, i) => (
              <li key={i} className={`card p-5 ${item.daysLeft != null && item.daysLeft <= 3 ? 'border-danger/40' : ''}`}>
                <p className="eyebrow text-[10px]">{item.type}</p>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted">{item.subtitle}</p>
                <Link to={`/orders/${item.orderId}`} className="mt-3 inline-block text-sm text-accent">View order →</Link>
              </li>
            ))}
            {!items.length && <p className="text-muted">No items in this view.</p>}
          </ul>
        )}
      </div>
    </div>
  );
}
