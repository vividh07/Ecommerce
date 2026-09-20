import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { formatINR } from '../lib/money';
import { AccountSidebar } from '../components/layout/AccountSidebar';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { StatusBadge, orderStatusVariant, friendlyOrderStatus } from '../components/ui/StatusBadge';
import { IconSearch } from '../components/icons/Icons';
import type { Order } from '../types';
import { Skeleton } from '../components/ui/Skeleton';

type Tab = 'all' | 'progress' | 'delivered';

function formatLongDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function estimatedArrival(order: Order) {
  if (order.deliveredAt) return `Delivered ${formatLongDate(order.deliveredAt)}`;
  const eta = new Date(order.createdAt);
  eta.setDate(eta.getDate() + 4);
  return `Estimated arrival ${formatLongDate(eta.toISOString())}`;
}

function orderActions(order: Order) {
  if (order.status === 'DELIVERED') {
    return {
      primary: { to: `/orders/${order._id}`, label: 'Buy again →' },
      secondary: { to: `/account/returns/${order._id}`, label: 'Request return' },
    };
  }
  return {
    primary: { to: `/orders/${order._id}`, label: 'Track order →' },
    secondary: { to: `/orders/${order._id}`, label: 'View details' },
  };
}

export function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api
      .get('/orders')
      .then((res) => setOrders(res.data.items ?? []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = orders;
    if (tab === 'delivered') list = list.filter((o) => o.status === 'DELIVERED');
    else if (tab === 'progress') list = list.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o._id.toLowerCase().includes(q) ||
          o.items.some((i) => i.productName.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [orders, tab, search]);

  const counts = {
    all: orders.length,
    progress: orders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length,
    delivered: orders.filter((o) => o.status === 'DELIVERED').length,
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
      <AccountSidebar />
      <div className="min-w-0 flex-1">
        <Breadcrumbs
          items={[{ label: 'HOME', to: '/browse' }, { label: 'ACCOUNT' }, { label: 'ORDERS' }]}
        />
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
          {([
            { id: 'all' as Tab, label: 'All' },
            { id: 'progress' as Tab, label: 'In progress' },
            { id: 'delivered' as Tab, label: 'Delivered' },
          ]).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                tab === t.id
                  ? 'bg-[#d4ff3f] font-semibold text-accent-fg'
                  : 'border border-border text-muted hover:text-text'
              }`}
            >
              {t.label} ({counts[t.id]})
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
              const actions = orderActions(o);
              const thumbs = o.items.slice(0, 3);
              return (
                <li key={o._id} className="panel p-5 md:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
                    <div className="min-w-[9rem] shrink-0">
                      <p className="font-semibold">Order #{o._id.slice(-4).toUpperCase()}</p>
                      <p className="mt-1 text-sm text-muted">{formatLongDate(o.createdAt)}</p>
                      <p className="mt-0.5 text-sm text-muted">
                        {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {thumbs.map((item, i) => (
                        <div
                          key={`${o._id}-${i}`}
                          className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-[8px] border border-border bg-panel-2 text-[10px] font-medium uppercase tracking-wide text-muted"
                          title={item.productName}
                        >
                          {item.productName.slice(0, 2)}
                        </div>
                      ))}
                      {o.items.length > 3 ? (
                        <div className="flex h-16 w-16 items-center justify-center rounded-[8px] border border-border bg-panel-2 text-xs text-muted">
                          +{o.items.length - 3}
                        </div>
                      ) : null}
                    </div>

                    <div className="min-w-0 flex-1 xl:pl-4">
                      <p className="text-base font-semibold">{formatINR(o.totalAmount)}</p>
                      <div className="mt-2">
                        <StatusBadge
                          label={friendlyOrderStatus(o.status)}
                          variant={orderStatusVariant(o.status)}
                          appearance="filled"
                        />
                      </div>
                      <p className="mt-2 text-xs text-muted">{estimatedArrival(o)}</p>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row xl:shrink-0 xl:flex-col">
                      <Link to={actions.primary.to} className="btn-primary text-center text-sm whitespace-nowrap">
                        {actions.primary.label}
                      </Link>
                      <Link to={actions.secondary.to} className="btn-outline text-center text-sm whitespace-nowrap">
                        {actions.secondary.label}
                      </Link>
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
