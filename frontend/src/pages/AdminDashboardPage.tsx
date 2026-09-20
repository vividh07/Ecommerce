import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { formatINR } from '../lib/money';
import { useAuth } from '../context/AuthContext';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { StatusBadge, orderStatusVariant } from '../components/ui/StatusBadge';
import {
  IconBell,
  IconChevronDown,
  IconChevronRight,
  IconMore,
  IconPackage,
  IconPlus,
  IconSearch,
  IconTruck,
  IconWarning,
} from '../components/icons/Icons';
import type { Product } from '../types';
import { Skeleton } from '../components/ui/Skeleton';

type PendingSeller = {
  _id: string;
  storeName: string;
  userId: { name: string; email: string };
};

const DEMO_ORDERS = [
  {
    id: '1048',
    date: '20 Sep 2024',
    product: 'Bose QuietComfort Ultra',
    meta: 'Wireless headphones',
    customer: 'A. Mehta',
    amount: 34900,
    payment: 'Paid' as const,
    fulfilment: 'Shipped' as const,
  },
  {
    id: '1047',
    date: '19 Sep 2024',
    product: 'Arc Desk Lamp',
    meta: 'Lighting',
    customer: 'R. Shah',
    amount: 8990,
    payment: 'Paid' as const,
    fulfilment: 'Processing' as const,
  },
  {
    id: '1046',
    date: '18 Sep 2024',
    product: 'Court Sneakers',
    meta: 'Footwear',
    customer: 'S. Khan',
    amount: 12900,
    payment: 'Pending' as const,
    fulfilment: 'Processing' as const,
  },
  {
    id: '1045',
    date: '17 Sep 2024',
    product: 'Olive Tote',
    meta: 'Bags',
    customer: 'N. Patel',
    amount: 4590,
    payment: 'Paid' as const,
    fulfilment: 'Delivered' as const,
  },
];

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [pending, setPending] = useState<PendingSeller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [sellersRes, productsRes] = await Promise.all([
        api.get('/admin/sellers/pending'),
        api.get('/products/admin/all'),
      ]);
      setPending(sellersRes.data.items ?? []);
      setProducts(productsRes.data.items ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user]);

  if (user?.role !== 'ADMIN') return <p className="p-8 text-muted">Admin access only.</p>;

  const initials = (user.name ?? 'SK')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const metrics = [
    {
      label: 'Revenue',
      value: formatINR(84250),
      delta: '+12%',
      sub: `vs. ${formatINR(75100)} yesterday`,
      warn: false,
    },
    {
      label: 'Orders',
      value: '38',
      delta: '+8%',
      sub: 'vs. 35 yesterday',
      warn: false,
    },
    {
      label: 'Products',
      value: String(products.length || 124),
      delta: '+3%',
      sub: `vs. ${Math.max(0, (products.length || 124) - 4)} yesterday`,
      warn: false,
    },
    {
      label: 'Low stock',
      value: '7',
      delta: '+40%',
      sub: 'vs. 5 yesterday',
      warn: true,
    },
  ];

  const attention = [
    { icon: IconWarning, label: '7 products low in stock' },
    { icon: IconTruck, label: '3 pending shipments' },
    { icon: IconPackage, label: `${pending.length} pending seller${pending.length === 1 ? '' : 's'}` },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-bg md:flex-row">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <header className="flex flex-wrap items-center gap-4 border-b border-border px-4 py-4 md:px-6">
          <div className="relative min-w-0 flex-1">
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              className="w-full rounded-full border border-border bg-[#111] py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-muted focus:border-accent/40"
              placeholder="Search products, orders, customers..."
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="relative rounded-full border border-border p-2.5 text-muted hover:text-text">
              <IconBell className="h-4 w-4" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-full border border-border py-1.5 pl-1.5 pr-3 text-sm"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4ff3f] text-xs font-bold text-accent-fg">
                {initials}
              </span>
              <IconChevronDown className="h-3.5 w-3.5 text-muted" />
            </button>
          </div>
        </header>

        <main className="p-4 md:p-8">
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="font-display text-4xl uppercase tracking-wide md:text-5xl">Store overview</h1>
                  <p className="mt-2 text-sm text-muted">
                    Welcome back! Here&apos;s what&apos;s happening with your store today.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" className="btn-outline text-sm">
                    Today
                    <IconChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <Link to="/admin" className="btn-primary text-sm">
                    <IconPlus className="h-4 w-4" />
                    Add product
                  </Link>
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {metrics.map((m) => (
                  <div key={m.label} className="panel p-5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm text-muted">{m.label}</p>
                      {m.warn ? <IconWarning className="h-4 w-4 text-warning" /> : null}
                    </div>
                    <p className="mt-2 text-2xl font-semibold tracking-tight">{m.value}</p>
                    <p className={`mt-1 text-xs font-medium ${m.warn ? 'text-warning' : 'text-[#d4ff3f]'}`}>
                      {m.delta}
                    </p>
                    <p className="mt-1 text-[11px] text-muted">{m.sub}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="panel p-6 lg:col-span-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="font-semibold">Revenue trend</p>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatINR(84250)}</p>
                      <p className="text-xs text-[#d4ff3f]">+12%</p>
                    </div>
                  </div>
                  <svg viewBox="0 0 400 140" className="mt-4 h-44 w-full" aria-hidden>
                    <defs>
                      <linearGradient id="adminRevFill" x1="0" x2="0" y1="0" y2="1">
                        <stop stopColor="#d4ff3f" stopOpacity="0.35" />
                        <stop offset="1" stopColor="#d4ff3f" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[0, 40, 80, 120].map((y) => (
                      <line key={y} x1="0" x2="400" y1={y + 10} y2={y + 10} stroke="rgba(255,255,255,0.06)" />
                    ))}
                    <polyline
                      fill="url(#adminRevFill)"
                      stroke="none"
                      points="0,110 57,95 114,100 171,70 228,78 285,42 342,55 400,28 400,140 0,140"
                    />
                    <polyline
                      fill="none"
                      stroke="#d4ff3f"
                      strokeWidth="2.5"
                      strokeLinejoin="round"
                      points="0,110 57,95 114,100 171,70 228,78 285,42 342,55 400,28"
                    />
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                      <text
                        key={d}
                        x={i * 57 + 10}
                        y={136}
                        fill="#9ca3af"
                        fontSize="10"
                      >
                        {d}
                      </text>
                    ))}
                  </svg>
                </div>

                <div className="panel p-6">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">Needs attention</p>
                    <span className="text-xs text-[#d4ff3f]">View all</span>
                  </div>
                  <ul className="mt-4 space-y-1">
                    {attention.map((item) => {
                      const Icon = item.icon;
                      return (
                        <li key={item.label}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-[8px] px-2 py-3 text-left text-sm hover:bg-white/5"
                          >
                            <Icon className="h-4 w-4 shrink-0 text-muted" />
                            <span className="flex-1">{item.label}</span>
                            <IconChevronRight className="h-4 w-4 text-muted" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              <div className="panel mt-6 overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <p className="font-semibold">Recent orders</p>
                  <span className="text-xs text-[#d4ff3f]">View all orders →</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead className="text-[11px] uppercase tracking-widest text-muted">
                      <tr className="border-b border-border">
                        <th className="px-5 py-3 font-medium">Order</th>
                        <th className="px-5 py-3 font-medium">Product</th>
                        <th className="px-5 py-3 font-medium">Customer</th>
                        <th className="px-5 py-3 font-medium">Amount</th>
                        <th className="px-5 py-3 font-medium">Payment</th>
                        <th className="px-5 py-3 font-medium">Fulfilment</th>
                        <th className="px-5 py-3 font-medium" />
                      </tr>
                    </thead>
                    <tbody>
                      {(products.length
                        ? products.slice(0, 4).map((p, i) => ({
                            id: String(1000 + i),
                            date: new Date().toLocaleDateString(undefined, {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }),
                            product: p.name,
                            meta: 'Catalog',
                            customer: 'Customer',
                            amount: p.basePrice,
                            payment: (i % 3 === 0 ? 'Pending' : 'Paid') as 'Paid' | 'Pending',
                            fulfilment: (['Shipped', 'Processing', 'Delivered', 'Processing'] as const)[i % 4],
                            image: p.images?.[0],
                          }))
                        : DEMO_ORDERS.map((o) => ({ ...o, image: undefined }))
                      ).map((row) => (
                        <tr key={row.id} className="border-b border-border last:border-0">
                          <td className="px-5 py-4 align-middle">
                            <p className="font-medium">#{row.id}</p>
                            <p className="text-xs text-muted">{row.date}</p>
                          </td>
                          <td className="px-5 py-4 align-middle">
                            <div className="flex items-center gap-3">
                              {row.image ? (
                                <img
                                  src={row.image}
                                  alt=""
                                  className="h-10 w-10 rounded-[8px] border border-border object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-[8px] border border-border bg-panel-2 text-[10px] uppercase text-muted">
                                  {row.product.slice(0, 2)}
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{row.product}</p>
                                <p className="text-xs text-muted">{row.meta}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-muted">{row.customer}</td>
                          <td className="px-5 py-4 font-medium">{formatINR(row.amount)}</td>
                          <td className="px-5 py-4">
                            <StatusBadge
                              label={row.payment}
                              variant={row.payment === 'Paid' ? 'paid' : 'pending'}
                            />
                          </td>
                          <td className="px-5 py-4">
                            <StatusBadge
                              label={row.fulfilment}
                              variant={orderStatusVariant(
                                row.fulfilment === 'Shipped'
                                  ? 'SHIPPED'
                                  : row.fulfilment === 'Delivered'
                                    ? 'DELIVERED'
                                    : 'CONFIRMED',
                              )}
                            />
                          </td>
                          <td className="px-5 py-4">
                            <button type="button" className="text-muted hover:text-text" aria-label="More">
                              <IconMore className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {pending.length > 0 && (
                <section className="mt-8">
                  <h2 className="font-semibold">Pending sellers</h2>
                  <ul className="mt-4 space-y-2">
                    {pending.map((s) => (
                      <li key={s._id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
                        <span>
                          {s.storeName} · {s.userId?.email}
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn-primary text-sm"
                            onClick={async () => {
                              await api.post(`/admin/sellers/${s._id}/approve`);
                              toast.success('Approved');
                              load();
                            }}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="btn-outline text-sm"
                            onClick={async () => {
                              await api.post(`/admin/sellers/${s._id}/reject`);
                              load();
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {products.length > 0 && (
                <section className="mt-8">
                  <h2 className="font-semibold">Catalog snapshot</h2>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {products.slice(0, 6).map((p) => (
                      <li key={p._id} className="panel flex items-center gap-3 p-3">
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt=""
                            className="h-12 w-12 rounded-[8px] object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-panel-2 text-xs text-muted">
                            {p.name.slice(0, 2)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{p.name}</p>
                          <p className="text-xs text-muted">{formatINR(p.basePrice)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
