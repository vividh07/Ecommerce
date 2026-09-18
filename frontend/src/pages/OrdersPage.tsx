import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { AccountSidebar } from '../components/layout/AccountSidebar';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { StatusBadge, orderStatusVariant } from '../components/ui/StatusBadge';
import { IconSearch } from '../components/icons/Icons';
import type { Order } from '../types';
import { Skeleton } from '../components/ui/Skeleton';

type Tab = 'all' | 'progress' | 'delivered';

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data.items ?? [])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (tab === 'delivered') list = list.filter((o) => o.status === 'DELIVERED');
    else if (tab === 'progress') list = list.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((o) => o._id.toLowerCase().includes(q) || o.items.some((i) => i.productName.toLowerCase().includes(q)));
    }
    return list;
  }, [orders, tab, search]);

  const counts = {
    all: orders.length,
    progress: orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
      <AccountSidebar />
      <div>
        <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'ACCOUNT' }, { label: 'ORDERS' }]} />
        <h1 className="page-title mt-4">Your finds. All here.</h1>
        <p className="mt-3 text-sm text-muted">Track, manage and enjoy your orders.</p>

        <div className="relative mt-8 max-w-md">
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            className="input-pill"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {(['all', 'progress', 'delivered'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-2 text-sm ${
                tab === t ? 'bg-accent font-semibold text-accent-fg' : 'border border-border text-muted hover:text-text'
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
            {filtered.map((o) => {
              return (
                <li key={o._id} className="panel p-5 md:p-6">
                  <div className="flex flex-col gap-5 md:flex-row md:items-center">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-border bg-panel-2 text-xs font-medium text-muted">
                        ×{o.items.length}
                      </div>
                      <div>
                        <p className="font-semibold">Order #{o._id.slice(-6).toUpperCase()}</p>
                        <p className="mt-1 text-sm text-muted">
                          {new Date(o.createdAt).toLocaleDateString(undefined, {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          · {o.items.length} items
                        </p>
                        <p className="mt-2 font-semibold">${o.totalAmount.toFixed(2)}</p>
                        <div className="mt-2">
                          <StatusBadge label={o.status.replace(/_/g, ' ')} variant={orderStatusVariant(o.status)} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row md:shrink-0">
                      <Link to={`/orders/${o._id}`} className="btn-primary text-center text-sm whitespace-nowrap">
                        Track order →
                      </Link>
                      {o.status === 'DELIVERED' && (
                        <Link
                          to={`/account/returns/${o._id}`}
                          className="btn-outline text-center text-sm whitespace-nowrap"
                        >
                          Request return
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
