import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Product } from '../types';
import { Skeleton } from '../components/ui/Skeleton';

type PendingSeller = {
  _id: string;
  storeName: string;
  description: string;
  userId: { name: string; email: string };
};

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

  async function approve(id: string) {
    await api.post(`/admin/sellers/${id}/approve`);
    toast.success('Seller approved');
    load();
  }

  async function reject(id: string) {
    await api.post(`/admin/sellers/${id}/reject`);
    toast.success('Seller rejected');
    load();
  }

  async function toggleProduct(id: string, isActive: boolean) {
    await api.patch(`/products/admin/${id}`, { isActive: !isActive });
    toast.success('Product updated');
    load();
  }

  if (user?.role !== 'ADMIN') {
    return <p className="text-muted">Admin access only.</p>;
  }

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-10">
      <h1 className="font-display text-3xl font-bold">Admin oversight</h1>

      <section>
        <h2 className="font-display text-xl font-semibold">Pending sellers</h2>
        {pending.length === 0 ? (
          <p className="mt-2 text-muted">No pending applications.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {pending.map((s) => (
              <li key={s._id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
                <div>
                  <p className="font-medium">{s.storeName}</p>
                  <p className="text-sm text-muted">{s.userId?.name} · {s.userId?.email}</p>
                  <p className="text-sm text-muted">{s.description}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="btn-primary" onClick={() => approve(s._id)}>Approve</button>
                  <button type="button" className="btn-ghost" onClick={() => reject(s._id)}>Reject</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Products</h2>
        <ul className="mt-4 space-y-2">
          {products.map((p) => (
            <li key={p._id} className="glass flex items-center justify-between rounded-xl p-4">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted">${p.basePrice}</p>
              </div>
              <button
                type="button"
                className="btn-ghost text-sm"
                onClick={() => toggleProduct(p._id, p.isActive ?? true)}
              >
                {p.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
