import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import type { Category, ProductVariant } from '../../types';
import {
  SellerCard,
  SellerDemoBadge,
  SellerPageHeader,
  sellerBtnOutline,
  sellerBtnPrimary,
  sellerInputClass,
} from '../../components/seller/sellerUi';
import { IconPlus } from '../../components/icons/Icons';
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
};

const emptyForm: EditorProduct = {
  name: '',
  description: '',
  basePrice: 0,
  images: [],
  categoryId: '',
  isActive: true,
  sku: '',
  stock: 0,
  compareAt: '',
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
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
        const res = await api.get('/products/mine', { params: { limit: 200 } });
        const list = res.data.items ?? [];
        const p = list.find((item: { _id: string }) => item._id === productId);
        if (!p) throw new Error('not found');
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
            stock: p.variants?.reduce((s: number, v: ProductVariant) => s + (v.stock ?? 0), 0) ?? 0,
            compareAt: '',
          });
        }
      } catch {
        toast.error('Product not found');
        navigate('/seller/products');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isNew, productId, navigate]);

  async function save(publish: boolean) {
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
        isActive: publish ? true : form.isActive,
      };
      let id = productId;
      if (isNew) {
        const res = await api.post('/products', payload);
        id = res.data.data?._id;
        if (!id) throw new Error('no id');
        await api.post(`/products/${id}/variants`, {
          attributes: {},
          price: payload.basePrice,
          stock: Math.max(0, Number(form.stock) || 0),
          sku: (form.sku || `SKU-${String(id).slice(-6)}`).toUpperCase(),
        });
        toast.success(publish ? 'Product published' : 'Draft saved');
        navigate(`/seller/products/${id}`);
      } else {
        await api.patch(`/products/${productId}`, payload);
        const variants = form.variants ?? [];
        if (variants.length === 0) {
          await api.post(`/products/${productId}/variants`, {
            attributes: {},
            price: payload.basePrice,
            stock: Math.max(0, Number(form.stock) || 0),
            sku: (form.sku || `SKU-${String(productId).slice(-6)}`).toUpperCase(),
          });
        } else {
          // Inventory "Quantity" maps to the first variant (multi-variant table stays display-only for now).
          const primary = variants[0];
          await api.patch(`/products/${productId}/variants/${primary._id}`, {
            stock: Math.max(0, Number(form.stock) || 0),
            sku: (form.sku || primary.sku).toUpperCase(),
            price: payload.basePrice,
          });
        }
        setForm((f) => ({ ...f, isActive: payload.isActive }));
        toast.success(publish ? 'Changes published' : 'Draft saved');
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string; details?: unknown } } })?.response?.data
          ?.message ?? 'Could not save product';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  function addImage() {
    const url = imageUrl.trim();
    if (!url) return;
    setForm((f) => ({ ...f, images: [...f.images, url].slice(0, 10) }));
    setImageUrl('');
  }

  function removeImage(index: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }));
  }

  async function onFilesSelected(files: FileList | null) {
    if (!files?.length) return;
    const remaining = 10 - form.images.length;
    if (remaining <= 0) {
      toast.error('Maximum 10 images');
      return;
    }
    const selected = Array.from(files).slice(0, remaining);
    for (const file of selected) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 10 MB`);
        return;
      }
    }

    const body = new FormData();
    selected.forEach((file) => body.append('images', file));

    setUploading(true);
    try {
      const res = await api.post('/uploads/product-images', body);
      const urls: string[] = res.data.data?.urls ?? [];
      if (!urls.length) throw new Error('empty');
      setForm((f) => ({ ...f, images: [...f.images, ...urls].slice(0, 10) }));
      toast.success(urls.length === 1 ? 'Image uploaded' : `${urls.length} images uploaded`);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Upload failed';
      toast.error(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  if (loading) return <Skeleton className="h-96 w-full !bg-[#e5e5e5]" />;

  return (
    <div>
      <p className="text-sm text-[#6b7280]">
        <Link to="/seller/products" className="hover:text-[#111]">
          Products
        </Link>
        <span className="mx-1.5">/</span>
        <span>{form.name || 'New product'}</span>
      </p>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <SellerPageHeader
          title={isNew ? 'Add product' : 'Edit product'}
          subtitle="Update your product details, pricing, inventory and more."
          badge={<SellerDemoBadge />}
          actions={
            <>
              <button type="button" className={sellerBtnOutline()} disabled={saving} onClick={() => save(false)}>
                Save draft
              </button>
              <button type="button" className={sellerBtnPrimary()} disabled={saving} onClick={() => save(true)}>
                Publish changes
              </button>
            </>
          }
        />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <SellerCard className="p-5">
            <label className="text-sm font-medium">Product name</label>
            <input
              className={sellerInputClass('mt-2')}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Product name"
            />
          </SellerCard>

          <SellerCard className="p-5">
            <label className="text-sm font-medium">Description</label>
            <div className="mt-2 rounded-[8px] border border-[#e5e5e5]">
              <div className="flex flex-wrap gap-1 border-b border-[#e5e5e5] bg-[#fafafa] px-2 py-1.5 text-xs text-[#6b7280]">
                {['Paragraph', 'B', 'I', 'U', 'List', 'Link'].map((t) => (
                  <span key={t} className="rounded px-2 py-1">
                    {t}
                  </span>
                ))}
              </div>
              <textarea
                className="min-h-[140px] w-full resize-y border-0 bg-white px-3.5 py-3 text-sm text-[#111] outline-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your product…"
              />
            </div>
          </SellerCard>

          <SellerCard className="p-5">
            <label className="text-sm font-medium">Media</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => onFilesSelected(e.target.files)}
            />
            <div className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_1fr]">
              <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[10px] border border-[#e5e5e5] bg-[#fafafa]">
                {form.images[0] ? (
                  <>
                    <img src={form.images[0]} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white"
                      onClick={() => removeImage(0)}
                    >
                      Remove
                    </button>
                  </>
                ) : (
                  <span className="text-sm text-[#9ca3af]">No image</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 content-start">
                {form.images.slice(1, 5).map((src, i) => (
                  <div key={`${src}-${i}`} className="relative aspect-square">
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full rounded-[8px] border border-[#e5e5e5] object-cover"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white"
                      onClick={() => removeImage(i + 1)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  disabled={uploading || form.images.length >= 10}
                  onClick={() => fileInputRef.current?.click()}
                  className="flex aspect-square flex-col items-center justify-center rounded-[8px] border border-dashed border-[#d4d4d4] bg-[#fafafa] p-2 text-center text-[11px] text-[#6b7280] transition hover:border-[#111] hover:text-[#111] disabled:opacity-50"
                >
                  <IconPlus className="mb-1 h-4 w-4" />
                  {uploading ? 'Uploading…' : 'Upload images'}
                  <span className="mt-0.5 text-[10px] text-[#9ca3af]">JPG, PNG · Max 10 MB</span>
                </button>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <input
                className={sellerInputClass()}
                placeholder="Or paste image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <button type="button" className={sellerBtnOutline('shrink-0')} onClick={addImage}>
                Add
              </button>
            </div>
          </SellerCard>

          <SellerCard className="overflow-hidden">
            <div className="border-b border-[#e5e5e5] px-5 py-4">
              <h3 className="text-sm font-semibold">Variants</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-[11px] uppercase tracking-widest text-[#9ca3af]">
                  <tr className="border-b border-[#e5e5e5]">
                    <th className="px-5 py-3 font-medium">Variant</th>
                    <th className="px-5 py-3 font-medium">SKU</th>
                    <th className="px-5 py-3 font-medium">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {(form.variants ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-5 py-6 text-[#6b7280]">
                        No variants yet. Add one after publishing, or stock is tracked on the product.
                      </td>
                    </tr>
                  ) : (
                    (form.variants ?? []).map((v) => (
                      <tr key={v._id} className="border-b border-[#f0f0f0]">
                        <td className="px-5 py-3">
                          {Object.values(v.attributes ?? {}).join(' / ') || 'Default'}
                        </td>
                        <td className="px-5 py-3 text-[#6b7280]">{v.sku}</td>
                        <td className="px-5 py-3">{v.stock}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-[#e5e5e5] px-5 py-3">
              <button type="button" className={sellerBtnOutline('!py-2 text-xs')} disabled>
                <IconPlus className="h-3.5 w-3.5" />
                Add variant
              </button>
            </div>
          </SellerCard>
        </div>

        <div className="space-y-5">
          <SellerCard className="p-5">
            <h3 className="text-sm font-semibold">Pricing</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#6b7280]">Selling price</label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af]">
                    ₹
                  </span>
                  <input
                    type="number"
                    className={sellerInputClass('pl-7')}
                    value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#6b7280]">Compare-at price</label>
                <div className="relative mt-1">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#9ca3af]">
                    ₹
                  </span>
                  <input
                    type="number"
                    className={sellerInputClass('pl-7')}
                    value={form.compareAt}
                    onChange={(e) => setForm({ ...form, compareAt: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#6b7280]">
              Set a higher compare-at price to show a discount on your store.
            </p>
          </SellerCard>

          <SellerCard className="p-5">
            <h3 className="text-sm font-semibold">Inventory</h3>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[#6b7280]">SKU</label>
                <input
                  className={sellerInputClass('mt-1')}
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-[#6b7280]">Quantity</label>
                <input
                  type="number"
                  className={sellerInputClass('mt-1')}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>
            </div>
          </SellerCard>

          <SellerCard className="p-5">
            <h3 className="text-sm font-semibold">Organization</h3>
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs text-[#6b7280]">Category</label>
                <select
                  className={sellerInputClass('mt-1')}
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-[#6b7280]">Product status</label>
                <select
                  className={sellerInputClass('mt-1')}
                  value={form.isActive ? 'active' : 'draft'}
                  onChange={(e) => setForm({ ...form, isActive: e.target.value === 'active' })}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#6b7280]">Active products are visible in your store.</p>
          </SellerCard>
        </div>
      </div>
    </div>
  );
}
