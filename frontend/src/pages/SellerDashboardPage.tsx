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
  const [coupons, setCoupons] = useState<any[]>([]);
  const [couponForm, setCouponForm] = useState({
    code: '',
    type: 'PERCENTAGE',
    value: '10',
    minOrderValue: '0',
    expiryDate: '',
    usageLimit: '100',
  });
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
        api.get('/orders/seller/mine').then((res) => setOrders(res.data.items ?? [])),
        api.get('/coupons/seller').then((res) => setCoupons(res.data.items ?? []))
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

      <section className="glass rounded-2xl p-6">
        <h2 className="font-display text-xl font-semibold">Store coupons</h2>
        <form
          className="mt-4 grid gap-2 md:grid-cols-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api.post('/coupons/seller', {
                code: couponForm.code,
                type: couponForm.type,
                value: Number(couponForm.value),
                minOrderValue: Number(couponForm.minOrderValue),
                expiryDate: couponForm.expiryDate,
                usageLimit: Number(couponForm.usageLimit),
              });
              toast.success('Coupon created');
              const res = await api.get('/coupons/seller');
              setCoupons(res.data.items ?? []);
            } catch (err: any) {
              toast.error(err.response?.data?.message ?? 'Failed');
            }
          }}
        >
          <input className="input-field" placeholder="Code" required value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })} />
          <select className="input-field" value={couponForm.type} onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FIXED">Fixed</option>
          </select>
          <input className="input-field" type="number" placeholder="Value" value={couponForm.value} onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })} />
          <input className="input-field" type="date" required value={couponForm.expiryDate} onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })} />
          <button type="submit" className="btn-primary md:col-span-2">Create coupon</button>
        </form>
        <ul className="mt-4 space-y-2 text-sm">
          {coupons.map((c) => (
            <li key={c._id} className="flex justify-between rounded-xl bg-white/5 px-3 py-2">
              <span>{c.code} · {c.type} {c.value}</span>
              <span className="text-muted">{c.timesUsed} used</span>
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
            {orders.map((o: any) => (
              <li key={o._id} className="glass rounded-xl p-4 text-sm">
                <p className="font-medium">Order #{o._id.slice(-6)} — ${o.totalAmount.toFixed(2)}</p>
                <p className="text-muted">Your status: {o.myFulfillment?.status ?? o.status}</p>
                <ul className="mt-1 text-muted">
                  {o.items.map((item: any, i: number) => (
                    <li key={i}>{item.productName} × {item.quantity}</li>
                  ))}
                </ul>
                <select
                  className="input-field mt-3"
                  defaultValue=""
                  onChange={async (e) => {
                    const status = e.target.value;
                    if (!status) return;
                    try {
                      await api.patch(`/orders/seller/${o._id}/status`, { status });
                      toast.success('Status updated');
                      const res = await api.get('/orders/seller/mine');
                      setOrders(res.data.items ?? []);
                    } catch (err: any) {
                      toast.error(err.response?.data?.message ?? 'Update failed');
                    }
                    e.target.value = '';
                  }}
                >
                  <option value="">Update fulfillment…</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="OUT_FOR_DELIVERY">Out for delivery</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
