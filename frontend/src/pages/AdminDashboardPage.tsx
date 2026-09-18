import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { AdminSidebar } from '../components/layout/AdminSidebar';
import { StatusBadge, orderStatusVariant } from '../components/ui/StatusBadge';
import type { Product } from '../types';
import { Skeleton } from '../components/ui/Skeleton';

type PendingSeller = {
  _id: string;
  storeName: string;
  userId: { name: string; email: string };
};

export function AdminDashboardPage() {
  const { user } = useAuth();
  const [pending, setPending] = useState<PendingSeller[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
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
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') load();
  }, [user]);

  if (user?.role !== 'ADMIN') return <p className="p-8 text-muted">Admin access only.</p>;

  const metrics = [
    { label: 'Revenue', value: '$84,250', delta: '+12%' },
    { label: 'Orders', value: String(orders.length || 38), delta: '+8%' },
    { label: 'Products', value: String(products.length), delta: '+3%' },
    { label: 'Low stock', value: '7', delta: '+40%', warn: true },
  ];

  return (
    <div className="flex min-h-screen bg-bg">
      <AdminSidebar />
      <div className="flex-1">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-4">
          <p className="wordmark text-lg tracking-[0.2em]">Nexus <span className="text-muted">| ADMIN</span></p>
          <Link to="/admin" className="btn-primary text-sm">+ Add product</Link>
        </header>
        <main className="p-6 md:p-8">
          {loading ? <Skeleton className="h-96 w-full" /> : (
            <>
              <h1 className="font-display text-4xl uppercase tracking-wide">Store overview</h1>
              <p className="mt-2 text-muted">Welcome back! Here&apos;s what&apos;s happening with your store today.</p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {metrics.map((m) => (
                  <div key={m.label} className="card p-5">
                    <p className="text-sm text-muted">{m.label}</p>
                    <p className="mt-2 text-2xl font-semibold">{m.value}</p>
                    <p className={`mt-1 text-xs ${m.warn ? 'text-warning' : 'text-accent'}`}>{m.delta}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-3">
                <div className="card p-6 lg:col-span-2">
                  <p className="font-semibold">Revenue trend</p>
                  <svg viewBox="0 0 400 120" className="mt-4 h-40 w-full text-accent">
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      points="0,100 60,80 120,90 180,50 240,60 300,30 360,40 400,20"
                    />
                    <polyline
                      fill="url(#g)"
                      stroke="none"
                      points="0,100 60,80 120,90 180,50 240,60 300,30 360,40 400,20 400,120 0,120"
                      opacity="0.15"
                    />
                    <defs>
                      <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                        <stop stopColor="#d4ff3f" />
                        <stop offset="1" stopColor="transparent" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <div className="card p-6">
                  <div className="flex justify-between">
                    <p className="font-semibold">Needs attention</p>
                    <span className="text-xs text-accent">View all</span>
                  </div>
                  <ul className="mt-4 space-y-3 text-sm">
                    <li className="flex justify-between border-b border-border pb-2">7 products low in stock →</li>
                    <li className="flex justify-between border-b border-border pb-2">3 pending shipments →</li>
                    <li className="flex justify-between">{pending.length} seller applications →</li>
                  </ul>
                </div>
              </div>

              <div className="card mt-8 overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <p className="font-semibold">Recent orders</p>
                  <span className="text-xs text-accent">View all orders</span>
                </div>
                <table className="w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-widest text-muted">
                    <tr className="border-b border-border">
                      <th className="p-4">Order</th>
                      <th className="p-4">Product</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.slice(0, 4).map((p, i) => (
                      <tr key={p._id} className="border-b border-border last:border-0">
                        <td className="p-4">#{1000 + i}</td>
                        <td className="p-4">{p.name}</td>
                        <td className="p-4">${p.basePrice}</td>
                        <td className="p-4">
                          <StatusBadge label="Processing" variant={orderStatusVariant('CONFIRMED')} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pending.length > 0 && (
                <section className="mt-8">
                  <h2 className="font-semibold">Pending sellers</h2>
                  <ul className="mt-4 space-y-2">
                    {pending.map((s) => (
                      <li key={s._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                        <span>{s.storeName} · {s.userId?.email}</span>
                        <div className="flex gap-2">
                          <button type="button" className="btn-primary text-sm" onClick={async () => {
                            await api.post(`/admin/sellers/${s._id}/approve`);
                            toast.success('Approved');
                            load();
                          }}>Approve</button>
                          <button type="button" className="btn-outline text-sm" onClick={async () => {
                            await api.post(`/admin/sellers/${s._id}/reject`);
                            load();
                          }}>Reject</button>
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
