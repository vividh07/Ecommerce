import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Order, Product } from '../types';
import { Skeleton } from '../components/ui/Skeleton';

export function SellerDashboardPage() {
  const { user, seller, refreshProfile } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [applyForm, setApplyForm] = useState({ storeName: '', description: '' });
  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: '',
    description: '',
    basePrice: '',
    images: '',
  });
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/catalog/categories').then((res) => setCategories(res.data.data ?? []));
  }, []);

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

  async function applyAsSeller(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post('/sellers/apply', applyForm);
      toast.success('Application submitted');
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Could not apply');
    }
  }

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    try {
      const images = productForm.images.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.post('/products', {
        name: productForm.name,
        categoryId: productForm.categoryId,
        description: productForm.description,
        basePrice: Number(productForm.basePrice),
        images,
      });
      const productId = res.data.data._id;
      await api.post(`/products/${productId}/variants`, {
        attributes: { default: 'Standard' },
        price: Number(productForm.basePrice),
        stock: 10,
        sku: `SKU-${Date.now()}`,
      });
      toast.success('Product created with default variant');
      const list = await api.get('/products/mine');
      setProducts(list.data.items ?? []);
      setProductForm({ name: '', categoryId: '', description: '', basePrice: '', images: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Could not create product');
    }
  }

  if (loading) return <Skeleton className="h-64 w-full" />;

  if (user?.role !== 'SELLER' && user?.role !== 'ADMIN') {
    return <p className="text-muted">Seller access only.</p>;
  }

  if (!seller) {
    return (
      <div className="mx-auto max-w-lg glass rounded-2xl p-6">
        <h1 className="font-display text-2xl font-bold">Become a seller</h1>
        <form onSubmit={applyAsSeller} className="mt-4 space-y-3">
          <input className="input-field" placeholder="Store name" required value={applyForm.storeName} onChange={(e) => setApplyForm({ ...applyForm, storeName: e.target.value })} />
          <textarea className="input-field min-h-[100px]" placeholder="Description" value={applyForm.description} onChange={(e) => setApplyForm({ ...applyForm, description: e.target.value })} />
          <button type="submit" className="btn-primary">Submit for approval</button>
        </form>
      </div>
    );
  }

  if (!seller.isApproved) {
    return (
      <div className="glass rounded-2xl p-8 text-center">
        <h1 className="font-display text-2xl font-bold">Pending approval</h1>
        <p className="mt-2 text-muted">Your store &quot;{seller.storeName}&quot; is awaiting admin review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl font-bold">{seller.storeName}</h1>
        <p className="text-muted">Manage products and view orders</p>
      </div>

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-semibold">Add product</h2>
        <form onSubmit={createProduct} className="mt-4 grid gap-3 md:grid-cols-2">
          <input className="input-field md:col-span-2" placeholder="Name" required value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
          <select className="input-field" required value={productForm.categoryId} onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}>
            <option value="">Category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input className="input-field" placeholder="Base price" required type="number" value={productForm.basePrice} onChange={(e) => setProductForm({ ...productForm, basePrice: e.target.value })} />
          <textarea className="input-field md:col-span-2" placeholder="Description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} />
          <input className="input-field md:col-span-2" placeholder="Image URLs (comma-separated)" value={productForm.images} onChange={(e) => setProductForm({ ...productForm, images: e.target.value })} />
          <button type="submit" className="btn-primary md:col-span-2">Create product</button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Your products ({products.length})</h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {products.map((p) => (
            <li key={p._id} className="glass rounded-xl p-4">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-muted">${p.basePrice} · {p.isActive ? 'Active' : 'Inactive'}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Orders</h2>
        {orders.length === 0 ? (
          <p className="mt-2 text-muted">No orders yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {orders.map((o) => (
              <li key={o._id} className="glass rounded-xl p-4 text-sm">
                <p className="font-medium">Order #{o._id.slice(-6)} — ${o.totalAmount.toFixed(2)}</p>
                <ul className="mt-1 text-muted">
                  {o.items.map((item, i) => (
                    <li key={i}>{item.productName} × {item.quantity}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
