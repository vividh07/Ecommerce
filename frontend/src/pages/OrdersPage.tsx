import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { AccountSidebar } from '../components/layout/AccountSidebar';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { StatusBadge, orderStatusVariant } from '../components/ui/StatusBadge';
import type { Order } from '../types';
import { Skeleton } from '../components/ui/Skeleton';

type Tab = 'all' | 'progress' | 'delivered';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data.items ?? [])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (tab === 'delivered') return orders.filter((o) => o.status === 'DELIVERED');
    if (tab === 'progress') return orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
    return orders;
  }, [orders, tab]);

  const counts = {
    all: orders.length,
    progress: orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <AccountSidebar />
      <div>
        <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'ACCOUNT' }, { label: 'ORDERS' }]} />
        <h1 className="page-title mt-4">Your finds. All here.</h1>
        <p className="mt-2 text-muted">Track, manage and enjoy your orders.</p>

        <div className="mt-8 flex flex-wrap gap-2">
          {(['all', 'progress', 'delivered'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-sm capitalize ${
                tab === t ? 'bg-accent text-accent-fg font-semibold' : 'border border-border text-muted'
              }`}
            >
              {t === 'all' ? 'All' : t === 'progress' ? 'In progress' : 'Delivered'} ({counts[t]})
            </button>
          ))}
        </div>

        {loading ? (
          <Skeleton className="mt-8 h-48 w-full" />
        ) : filtered.length === 0 ? (
          <p className="mt-8 text-muted">No orders in this view.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {filtered.map((o) => (
              <li key={o._id} className="card grid gap-4 p-5 md:grid-cols-[1fr_auto_auto] md:items-center">
                <div>
                  <p className="font-semibold">Order #{o._id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-muted">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${o.totalAmount.toFixed(2)}</p>
                  <StatusBadge label={o.status.replace(/_/g, ' ')} variant={orderStatusVariant(o.status)} />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link to={`/orders/${o._id}`} className="btn-primary text-center text-sm">Track order →</Link>
                  {o.status === 'DELIVERED' && (
                    <Link to={`/account/returns/${o._id}`} className="btn-outline text-center text-sm">Request return</Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
