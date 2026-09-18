import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Order, Product } from '../types';
import { Skeleton } from '../components/ui/Skeleton';
import { StatusBadge, orderStatusVariant } from '../components/ui/StatusBadge';

export function SellerDashboardPage() {
  const { user, seller, refreshProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [applyForm, setApplyForm] = useState({ storeName: '', description: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const tasks: Promise<unknown>[] = [refreshProfile()];
    if (seller?.isApproved) {
      tasks.push(
        api.get('/products/mine').then((res) => setProducts(res.data.items ?? [])),
        api.get('/orders/seller/mine').then((res) => setOrders(res.data.items ?? []))
      );
    }
    Promise.all(tasks).finally(() => setLoading(false));
  }, [user, seller?.isApproved, refreshProfile]);

  if (loading) return <Skeleton className="h-64 w-full" />;

  if (!seller) {
    return (
      <div className="mx-auto max-w-lg card p-8">
        <h1 className="page-title text-4xl">Sell on Nexus</h1>
        <form className="mt-6 space-y-3" onSubmit={async (e) => {
          e.preventDefault();
          await api.post('/sellers/apply', applyForm);
          toast.success('Application sent');
          await refreshProfile();
        }}>
          <input className="input-field" placeholder="Store name" required value={applyForm.storeName} onChange={(e) => setApplyForm({ ...applyForm, storeName: e.target.value })} />
          <textarea className="input-field min-h-[100px]" placeholder="Description" value={applyForm.description} onChange={(e) => setApplyForm({ ...applyForm, description: e.target.value })} />
          <button type="submit" className="btn-primary w-full">Submit</button>
        </form>
      </div>
    );
  }

  if (!seller.isApproved) {
    return (
      <div className="card mx-auto max-w-lg p-8 text-center">
        <h1 className="font-display text-3xl uppercase">Pending approval</h1>
        <p className="mt-2 text-muted">{seller.storeName}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow">Seller hub</p>
      <h1 className="page-title mt-2">{seller.storeName}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="text-muted text-sm">Products</p><p className="text-2xl font-semibold">{products.length}</p></div>
        <div className="card p-5"><p className="text-muted text-sm">Orders</p><p className="text-2xl font-semibold">{orders.length}</p></div>
        <Link to="/browse" className="card flex items-center justify-center p-5 text-accent hover:bg-white/5">View storefront →</Link>
      </div>
      <section className="mt-10">
        <h2 className="font-semibold">Orders</h2>
        <ul className="mt-4 space-y-3">
          {orders.map((o: any) => (
            <li key={o._id} className="card p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-medium">#{o._id.slice(-6)}</p>
                <StatusBadge label={o.myFulfillment?.status ?? o.status} variant={orderStatusVariant(o.status)} />
              </div>
              <select className="input-field mt-3" defaultValue="" onChange={async (e) => {
                const status = e.target.value;
                if (!status) return;
                await api.patch(`/orders/seller/${o._id}/status`, { status });
                toast.success('Updated');
              }}>
                <option value="">Update status…</option>
                <option value="SHIPPED">Shipped</option>
                <option value="OUT_FOR_DELIVERY">Out for delivery</option>
                <option value="DELIVERED">Delivered</option>
              </select>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
