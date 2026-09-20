import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { formatINR } from '../lib/money';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { ProductCard } from '../components/products/ProductCard';
import { IconBag, IconBolt, IconChevronRight, IconHeart, IconPin, IconSearch } from '../components/icons/Icons';
import { Skeleton } from '../components/ui/Skeleton';
import type { Category, Product, ProductVariant } from '../types';

const SWATCH: Record<string, string> = {
  silver: '#c0c0c0',
  charcoal: '#2f2f2f',
  orange: '#e85d04',
  olive: '#556b2f',
  white: '#f5f5f5',
  black: '#111111',
};

function colorFromAttrs(attrs: Record<string, string> | undefined) {
  if (!attrs) return null;
  const color = attrs.color || attrs.Color;
  return color ?? null;
}

function swatchHex(name: string) {
  return SWATCH[name.toLowerCase()] ?? '#888888';
}

function attrsToObject(attrs: ProductVariant['attributes'] | undefined | null): Record<string, string> {
  if (!attrs) return {};
  if (attrs instanceof Map) return Object.fromEntries(attrs.entries());
  return attrs as Record<string, string>;
}

const FEATURES = [
  { label: 'Noise cancellation' },
  { label: 'Wireless listening' },
  { label: 'Comfort fit' },
];

export function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem, activeCartId } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [qty, setQty] = useState(1);
  const [thumb, setThumb] = useState(0);
  const [pin, setPin] = useState('');
  const [openAccordion, setOpenAccordion] = useState<string | null>('overview');

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    api
      .get(`/catalog/products/${productId}`)
      .then((detailRes) => {
        const data = detailRes.data.data;
        setProduct(data.product);
        setVariants(data.variants ?? []);
        setCategory(data.category ?? null);
        if (data.variants?.[0]) setSelectedVariant(data.variants[0]._id);
        setThumb(0);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  useEffect(() => {
    api.get('/catalog/products', { params: { limit: 8, sort: 'newest' } }).then((res) => {
      const items: Product[] = res.data.items ?? [];
      setRelated(items.filter((p) => p._id !== productId).slice(0, 4));
    });
  }, [productId]);

  const variant = useMemo(() => variants.find((v) => v._id === selectedVariant), [variants, selectedVariant]);
  const images = product?.images?.length ? product.images : [''];
  const variantAttrs = attrsToObject(variant?.attributes);
  const colorName = colorFromAttrs(variantAttrs);
  const colorVariants = useMemo(() => {
    const seen = new Map<string, ProductVariant>();
    variants.forEach((v) => {
      const c = colorFromAttrs(attrsToObject(v.attributes));
      if (c && !seen.has(c)) seen.set(c, v);
    });
    return [...seen.entries()];
  }, [variants]);

  const subtitle =
    product?.description?.split(/[.!]/)[0]?.trim() ||
    (colorName ? `${colorName} edition` : 'Premium product');

  async function requireAuth(): Promise<boolean> {
    if (user) return true;
    toast.error('Sign in to continue');
    navigate('/login');
    return false;
  }

  async function addToBag() {
    if (!(await requireAuth())) return;
    if (!selectedVariant) return toast.error('Select a variant');
    await addItem(selectedVariant, qty);
  }

  async function buyNow() {
    if (!(await requireAuth())) return;
    if (!selectedVariant) return toast.error('Select a variant');
    await addItem(selectedVariant, qty);
    navigate(`/checkout/address${activeCartId ? `?cartId=${activeCartId}` : ''}`);
  }

  function checkPin() {
    const cleaned = pin.replace(/\D/g, '');
    if (cleaned.length !== 6) {
      toast.error('Enter a valid 6-digit PIN code');
      return;
    }
    toast.success(`Delivery available to ${cleaned} · 3–6 business days`);
  }

  if (loading) return <Skeleton className="mt-8 h-96 w-full" />;
  if (!product) return <p className="mt-8 text-muted">Product not found.</p>;

  const catLabel = (category?.name ?? 'Catalog').toUpperCase();

  return (
    <div>
      <Breadcrumbs
        items={[
          { label: 'HOME', to: '/' },
          { label: catLabel, to: `/browse?category=${encodeURIComponent((category?.name ?? '').toLowerCase())}` },
          { label: product.name.toUpperCase() },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-[12px] border border-border bg-[#151515]">
            <img
              src={images[thumb]}
              alt={product.name}
              className="h-full w-full object-contain p-6"
            />
            <span className="absolute left-4 top-4 rounded-full bg-bg/70 p-2 text-text backdrop-blur-sm">
              <IconSearch className="h-4 w-4" />
            </span>
            <button
              type="button"
              className="absolute right-4 top-4 rounded-full bg-bg/70 p-2 text-text backdrop-blur-sm hover:text-accent"
              onClick={() => {
                if (!user) {
                  toast.error('Sign in required');
                  return;
                }
                toggle(productId!).catch(() => toast.error('Could not update wishlist'));
              }}
              aria-label="Wishlist"
            >
              <IconHeart className="h-4 w-4" filled={isWishlisted(productId!)} />
            </button>
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setThumb(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-[8px] border bg-[#151515] ${
                    thumb === i ? 'border-accent' : 'border-border'
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-contain p-1" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow text-text/80">
            {catLabel}
            {colorName ? ` / ${colorName.toUpperCase()}` : ''}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{product.name}</h1>
          <p className="mt-2 text-muted">{subtitle}</p>
          <p className="mt-6 text-2xl font-semibold md:text-3xl">
            {formatINR(variant?.price ?? product.basePrice)}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">{product.description}</p>

          {colorVariants.length > 0 && (
            <div className="mt-8">
              <p className="text-sm">
                Color: <span className="font-medium text-text">{colorName ?? '—'}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {colorVariants.map(([name, v]) => (
                  <button
                    key={v._id}
                    type="button"
                    title={name}
                    onClick={() => setSelectedVariant(v._id)}
                    className={`h-9 w-9 rounded-full border-2 ${
                      selectedVariant === v._id ? 'border-accent' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: swatchHex(name) }}
                  />
                ))}
              </div>
            </div>
          )}

          {variants.length > 0 && !colorVariants.length && (
            <div className="mt-8">
              <p className="text-sm font-medium">Options</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v._id}
                    type="button"
                    onClick={() => setSelectedVariant(v._id)}
                    className={`rounded-full border px-4 py-2 text-sm ${
                      selectedVariant === v._id ? 'border-accent text-accent' : 'border-border text-muted'
                    }`}
                  >
                    {Object.values(attrsToObject(v.attributes)).join(' · ') || v.sku}
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-5 flex items-center gap-2 text-sm">
            <span className={`h-2 w-2 rounded-full ${(variant?.stock ?? 0) > 0 ? 'bg-accent' : 'bg-warning'}`} />
            {(variant?.stock ?? 0) > 0 ? 'In stock' : 'Out of stock'}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="qty-control">
              <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease">
                −
              </button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button type="button" onClick={() => setQty(qty + 1)} aria-label="Increase">
                +
              </button>
            </div>
            <button
              type="button"
              className="btn-primary min-w-0 flex-1"
              disabled={!variant?.stock}
              onClick={() => addToBag().catch(() => {})}
            >
              <IconBag className="h-4 w-4" /> Add to bag
            </button>
            <button
              type="button"
              className="btn-outline px-4"
              onClick={() => {
                if (!user) return toast.error('Sign in required');
                toggle(productId!).catch(() => toast.error('Could not update wishlist'));
              }}
              aria-label="Wishlist"
            >
              <IconHeart filled={isWishlisted(productId!)} />
            </button>
          </div>

          <button type="button" className="btn-outline mt-3 w-full" onClick={() => buyNow().catch(() => {})}>
            <IconBolt className="h-4 w-4" /> Buy now
          </button>

          <div className="mt-8">
            <p className="text-sm font-medium">Check delivery</p>
            <div className="mt-2 flex items-center gap-2 rounded-[8px] border border-border bg-panel-2 px-3">
              <IconPin className="h-4 w-4 shrink-0 text-muted" />
              <input
                className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted"
                placeholder="Enter PIN code"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && checkPin()}
                inputMode="numeric"
                maxLength={6}
              />
              <button type="button" className="shrink-0 text-sm font-semibold text-accent" onClick={checkPin}>
                Check
              </button>
            </div>
            <p className="mt-2 text-xs text-muted">Enter PIN code for delivery options.</p>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 border-y border-border py-6">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border">
                  <span className="h-2 w-2 rounded-full bg-accent" />
                </span>
                <span className="text-[11px] leading-snug text-muted">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-2 divide-y divide-border">
            {[
              { id: 'overview', title: 'Overview', body: product.description },
              {
                id: 'specs',
                title: 'Specifications',
                body: [
                  category ? `Category: ${category.name}` : null,
                  colorName ? `Color: ${colorName}` : null,
                  variant?.sku ? `SKU: ${variant.sku}` : null,
                  `Price: ${formatINR(variant?.price ?? product.basePrice)}`,
                ]
                  .filter(Boolean)
                  .join('\n'),
              },
              {
                id: 'delivery',
                title: 'Delivery and returns',
                body: 'Standard delivery in 3–6 business days. Free returns within 14 days of delivery for unused items in original packaging.',
              },
            ].map((row) => {
              const open = openAccordion === row.id;
              return (
                <div key={row.id}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between py-4 text-left text-sm font-medium"
                    onClick={() => setOpenAccordion(open ? null : row.id)}
                  >
                    {row.title}
                    <IconChevronRight className={`h-4 w-4 text-muted transition ${open ? 'rotate-90' : ''}`} />
                  </button>
                  {open && <p className="whitespace-pre-line pb-4 text-sm text-muted">{row.body}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className="mt-16 border-t border-border pt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-semibold md:text-2xl">Pairs well with</h2>
          <Link to="/browse" className="text-sm font-medium text-accent hover:underline">
            See all →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard
              key={p._id}
              product={p}
              categoryLabel="CATALOG"
              wishlisted={isWishlisted(p._id)}
              onWishlistToggle={() => toggle(p._id).catch(() => {})}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
