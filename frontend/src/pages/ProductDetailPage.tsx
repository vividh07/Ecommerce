import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { IconBag, IconHeart } from '../components/icons/Icons';
import { Skeleton } from '../components/ui/Skeleton';
import type { ProductVariant, Review } from '../types';

export function ProductDetailPage() {
  const { productId } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [qty, setQty] = useState(1);
  const [thumb, setThumb] = useState(0);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    Promise.all([
      api.get(`/catalog/products/${productId}`),
      api.get(`/reviews/product/${productId}`, { params: { limit: 8 } }),
    ])
      .then(([detailRes, reviewRes]) => {
        const data = detailRes.data.data;
        setProduct(data.product);
        setVariants(data.variants ?? []);
        setReviews(reviewRes.data.items ?? []);
        if (data.variants?.[0]) setSelectedVariant(data.variants[0]._id);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  const variant = useMemo(() => variants.find((v) => v._id === selectedVariant), [variants, selectedVariant]);
  const images = product?.images?.length ? product.images : [''];

  if (loading) return <Skeleton className="h-96 w-full" />;
  if (!product) return <p className="text-muted">Product not found.</p>;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'DISCOVER', to: '/browse' }, { label: product.name }]} />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="card aspect-square overflow-hidden bg-surface-2">
            <img src={images[thumb]} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="mt-3 flex gap-2">
            {images.map((img: string, i: number) => (
              <button
                key={i}
                type="button"
                onClick={() => setThumb(i)}
                className={`h-16 w-16 overflow-hidden rounded-[8px] border ${thumb === i ? 'border-accent' : 'border-border'}`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="eyebrow">Catalog / Audio</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{product.name}</h1>
          <p className="mt-2 text-muted">{product.description?.slice(0, 80)}</p>
          <p className="mt-6 text-3xl font-semibold">${(variant?.price ?? product.basePrice).toFixed(2)}</p>
          {variants.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium">Variant</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v._id}
                    type="button"
                    onClick={() => setSelectedVariant(v._id)}
                    className={`rounded-full border px-4 py-2 text-sm ${selectedVariant === v._id ? 'border-accent text-accent' : 'border-border text-muted'}`}
                  >
                    {v.sku}
                  </button>
                ))}
              </div>
              <p className="mt-2 flex items-center gap-2 text-sm text-accent">
                <span className="h-2 w-2 rounded-full bg-accent" />
                {variant?.stock ? 'In stock' : 'Out of stock'}
              </p>
            </div>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="flex items-center rounded-[8px] border border-border">
              <button type="button" className="px-4 py-3" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span className="w-10 text-center">{qty}</span>
              <button type="button" className="px-4 py-3" onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button
              type="button"
              className="btn-primary flex-1"
              disabled={!variant?.stock}
              onClick={async () => {
                if (!user) return toast.error('Sign in to add to bag');
                await addItem(selectedVariant, qty);
              }}
            >
              <IconBag className="h-4 w-4" /> Add to bag
            </button>
            <button
              type="button"
              className="btn-outline px-4"
              onClick={() => user && toggle(productId!).catch(() => toast.error('Sign in required'))}
            >
              <IconHeart filled={isWishlisted(productId!)} />
            </button>
          </div>
          <Link to={`/checkout/address?buyNow=1`} className="btn-outline mt-3 w-full">Buy now</Link>
        </div>
      </div>
      <section className="mt-16 border-t border-border pt-10">
        <h2 className="font-display text-3xl uppercase">Reviews</h2>
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <li key={r._id} className="card p-4 text-sm">
              <p className="font-medium">{r.userId?.name} · ★ {r.rating}</p>
              <p className="mt-1 text-muted">{r.comment}</p>
            </li>
          ))}
          {!reviews.length && <p className="text-muted">No reviews yet.</p>}
        </ul>
      </section>
    </div>
  );
}
