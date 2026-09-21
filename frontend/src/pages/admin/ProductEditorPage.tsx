import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import type { Category, ProductVariant } from '../../types';
import { DemoBadge } from '../../components/admin/adminUi';
import { IconEye, IconPlus, IconSave } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';

type EditorProduct = {
  _id?: string;
  name: string;
  description: string;
  basePrice: number;
  images: string[];
  categoryId: string;
  isActive: boolean;
  variants?: ProductVariant[];
  sku?: string;
  stock?: number;
  compareAt?: string;
  weight?: string;
};

const emptyForm: EditorProduct = {
  name: '',
  description: '',
  basePrice: 0,
  images: [],
  categoryId: '',
  isActive: false,
  sku: '',
  stock: 0,
  compareAt: '',
  weight: '0.25',
};

export function ProductEditorPage() {
  const { productId } = useParams();
  const isNew = !productId || productId === 'new';
  const navigate = useNavigate();
  const [form, setForm] = useState<EditorProduct>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    api
      .get('/catalog/categories')
      .then((res) => setCategories(res.data.data ?? []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (isNew) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/products/admin/${productId}`);
        const p = res.data.data;
        if (!cancelled) {
          setForm({
            _id: p._id,
            name: p.name ?? '',
            description: p.description ?? '',
            basePrice: p.basePrice ?? 0,
            images: p.images ?? [],
            categoryId: typeof p.categoryId === 'object' ? p.categoryId?._id : p.categoryId,
            isActive: Boolean(p.isActive),
            variants: p.variants ?? [],
            sku: p.variants?.[0]?.sku ?? `SKU-${String(p._id).slice(-4).toUpperCase()}`,
            stock: p.variants?.[0]?.stock ?? 0,
            compareAt: '',
            weight: '0.25',
          });
        }
      } catch {
        toast.error('Product not found');
        navigate('/admin/products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNew, productId, navigate]);

  async function save() {
    if (!form.name.trim() || !form.categoryId) {
      toast.error('Name and category are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        basePrice: Number(form.basePrice) || 0,
        images: form.images,
        categoryId: form.categoryId,
        isActive: form.isActive,
      };
      if (isNew) {
        const res = await api.post('/products', payload);
        const created = res.data.data;
        if (form.sku && created?._id) {
          await api.post(`/products/${created._id}/variants`, {
            attributes: { Color: 'Default' },
            price: payload.basePrice,
            stock: Number(form.stock) || 0,
            sku: form.sku,
          });
        }
        toast.success('Product created');
        navigate(`/admin/products/${created._id}`);
      } else {
        await api.patch(`/products/${productId}`, payload);
        await api.patch(`/products/admin/${productId}`, { isActive: form.isActive });
        toast.success('Changes saved');
      }
    } catch {
      toast.error('Could not save product');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <p className="text-sm text-muted">
        <Link to="/admin/products" className="hover:text-text">
          Products
        </Link>
        {' / '}
        {form.name || 'New product'}
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              {isNew ? 'Add product' : 'Edit product'}
            </h1>
            <span
              className={`rounded-full border px-2.5 py-0.5 text-xs ${
                form.isActive ? 'border-[#d4ff3f]/40 text-[#d4ff3f]' : 'border-warning/40 text-warning'
              }`}
            >
              {form.isActive ? 'Active' : 'Draft'}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted">Manage product details, pricing, inventory and more.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DemoBadge />
          <button type="button" className="btn-outline text-sm">
            <IconEye className="h-4 w-4" />
            Preview
          </button>
          <button type="button" className="btn-primary text-sm" disabled={saving} onClick={save}>
            <IconSave className="h-4 w-4" />
            Save changes
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="panel space-y-4 p-5">
            <h2 className="font-semibold">Product details</h2>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">
                Product name <span className="text-danger">*</span>
              </span>
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">Description</span>
              <textarea
                className="input-field min-h-28"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">
                  Category <span className="text-danger">*</span>
                </span>
                <select
                  className="input-field"
                  value={form.categoryId}
                  onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">
                  SKU <span className="text-danger">*</span>
                </span>
                <input
                  className="input-field"
                  value={form.sku}
                  onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                />
              </label>
            </div>
          </section>

          <section className="panel space-y-4 p-5">
            <h2 className="font-semibold">Product media</h2>
            <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
              <div className="flex aspect-video items-center justify-center overflow-hidden rounded-[10px] border border-border bg-panel-2">
                {form.images[0] ? (
                  <img src={form.images[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <p className="text-sm text-muted">No image yet</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                {form.images.slice(0, 4).map((src) => (
                  <img
                    key={src}
                    src={src}
                    alt=""
                    className={`h-14 w-full rounded-[8px] border object-cover ${
                      src === form.images[0] ? 'border-[#d4ff3f]' : 'border-border'
                    }`}
                  />
                ))}
                <div className="flex h-14 items-center justify-center rounded-[8px] border border-dashed border-border text-xs text-muted">
                  + Add images
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                className="input-field flex-1"
                placeholder="Paste image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button
                type="button"
                className="btn-outline text-sm"
                onClick={() => {
                  if (!imageUrl.trim()) return;
                  setForm((f) => ({ ...f, images: [...f.images, imageUrl.trim()] }));
                  setImageUrl('');
                }}
              >
                <IconPlus className="h-4 w-4" />
                Add images
              </button>
            </div>
            <p className="text-xs text-muted">Supports JPG, PNG, WebP. Max 10MB per image.</p>
          </section>

          <section className="panel space-y-4 p-5">
            <h2 className="font-semibold">Pricing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Price</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">INR</span>
                  <input
                    className="input-field pl-12"
                    type="number"
                    min={0}
                    value={form.basePrice}
                    onChange={(e) => setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))}
                  />
                </div>
                <span className="mt-1 block text-xs text-muted">The price your customers will pay for this product.</span>
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Compare-at price</span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">INR</span>
                  <input
                    className="input-field pl-12"
                    placeholder="e.g. 39900"
                    value={form.compareAt}
                    onChange={(e) => setForm((f) => ({ ...f, compareAt: e.target.value }))}
                  />
                </div>
                <span className="mt-1 block text-xs text-muted">Show a higher price to display a discount (optional).</span>
              </label>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="panel space-y-4 p-5">
            <h2 className="font-semibold">Publishing</h2>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">Status</span>
              <select
                className="input-field"
                value={form.isActive ? 'active' : 'draft'}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value === 'active' }))}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">Visibility</span>
              <select className="input-field" defaultValue="online">
                <option value="online">Online store</option>
              </select>
            </label>
          </section>

          <section className="panel space-y-4 p-5">
            <h2 className="font-semibold">Inventory</h2>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked className="accent-[#d4ff3f]" />
              Track quantity
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">Available quantity</span>
              <input
                className="input-field"
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">Low-stock threshold</span>
              <input className="input-field" type="number" defaultValue={5} />
            </label>
          </section>

          <section className="panel space-y-3 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Variants</h2>
              <button type="button" className="text-xs text-[#d4ff3f]">
                Add variant
              </button>
            </div>
            {(form.variants?.length ? form.variants : [{ _id: 'default', attributes: { Color: 'Default' }, sku: form.sku ?? '', price: form.basePrice, stock: form.stock ?? 0, productId: '' }]).map((v, i) => (
              <div key={v._id} className="flex items-center justify-between rounded-[8px] border border-border px-3 py-2.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-muted" />
                  <span>{Object.values(v.attributes ?? {}).join(' / ') || 'Default'}</span>
                  {i === 0 ? (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted">
                      Default variant
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </section>

          <section className="panel space-y-4 p-5">
            <h2 className="font-semibold">Shipping</h2>
            <label className="block text-sm">
              <span className="mb-1.5 block text-muted">Weight</span>
              <div className="flex gap-2">
                <input
                  className="input-field"
                  value={form.weight}
                  onChange={(e) => setForm((f) => ({ ...f, weight: e.target.value }))}
                />
                <select className="input-field w-24" defaultValue="kg">
                  <option value="kg">kg</option>
                </select>
              </div>
            </label>
          </section>
        </div>
      </div>
    </div>
  );
}
