import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Skeleton } from '../components/ui/Skeleton';
import type { ProductVariant, Review } from '../types';

export function ProductDetailPage() {
  const { productId } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ avgRating: 0, count: 0 });
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    Promise.all([
      api.get(`/catalog/products/${productId}`),
      api.get(`/reviews/product/${productId}`, { params: { limit: 10 } }),
    ])
      .then(([detailRes, reviewRes]) => {
        const data = detailRes.data.data;
        setProduct(data.product);
        setVariants(data.variants ?? []);
        setStats(data.reviewStats ?? { avgRating: 0, count: 0 });
        setReviews(reviewRes.data.items ?? []);
        if (data.variants?.[0]) setSelectedVariant(data.variants[0]._id);
        document.title = `${data.product.name} | Nexus Market`;
      })
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [productId]);

  const variant = useMemo(
    () => variants.find((v) => v._id === selectedVariant),
    [variants, selectedVariant]
  );

  async function handleAdd() {
    if (!user) {
      toast.error('Sign in to add to cart');
      return;
    }
    if (!selectedVariant) return;
    await addItem(selectedVariant, qty);
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast.error('Sign in to review');
      return;
    }
    try {
      await api.post(`/reviews/product/${productId}`, reviewForm);
      toast.success('Review submitted');
      const res = await api.get(`/reviews/product/${productId}`);
      setReviews(res.data.items ?? []);
      setStats(res.data.stats ?? stats);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Could not submit review');
    }
  }

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full" />
        <div className="space-y-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!product) return <p className="text-muted">Product not found.</p>;

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass overflow-hidden rounded-3xl">
        <img
          src={product.images?.[0]}
          alt={product.name}
          className="aspect-square w-full object-cover"
        />
      </motion.div>
      <div>
        <p className="text-sm text-accent">{stats.count ? `★ ${stats.avgRating.toFixed(1)}` : 'No reviews yet'}</p>
        <h1 className="mt-2 font-display text-4xl font-bold">{product.name}</h1>
        <p className="mt-4 text-muted">{product.description}</p>
        <p className="mt-6 text-3xl font-semibold text-accent">
          ${(variant?.price ?? product.basePrice).toFixed(2)}
        </p>
        {variants.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm text-muted">Variant</p>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const label = Object.entries(v.attributes || {})
                  .map(([k, val]) => `${k}: ${val}`)
                  .join(', ');
                return (
                  <button
                    key={v._id}
                    type="button"
                    onClick={() => setSelectedVariant(v._id)}
                    className={`rounded-xl border px-3 py-2 text-sm transition ${
                      selectedVariant === v._id
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-white/5'
                    }`}
                  >
                    {label || v.sku}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-sm text-muted">
              {variant ? `${variant.stock} in stock` : 'Select a variant'}
            </p>
          </div>
        )}
        <div className="mt-6 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={variant?.stock ?? 1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="input-field w-20"
          />
          <button type="button" className="btn-primary" onClick={handleAdd} disabled={!variant?.stock}>
            Add to cart
          </button>
        </div>
      </div>

      <section className="lg:col-span-2">
        <h2 className="font-display text-2xl font-bold">Reviews</h2>
        {user && (
          <form onSubmit={submitReview} className="mt-4 glass rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted">Rating</label>
              <select
                className="input-field w-auto"
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>{r} stars</option>
                ))}
              </select>
            </div>
            <textarea
              className="input-field min-h-[80px]"
              placeholder="Share your experience (verified purchase required)"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
            />
            <button type="submit" className="btn-primary">Post review</button>
          </form>
        )}
        <ul className="mt-6 space-y-4">
          {reviews.map((r) => (
            <li key={r._id} className="glass rounded-xl p-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{r.userId?.name ?? 'Customer'}</span>
                <span className="text-accent">★ {r.rating}</span>
              </div>
              <p className="mt-2 text-muted">{r.comment}</p>
            </li>
          ))}
          {reviews.length === 0 && <p className="text-muted">No reviews yet.</p>}
        </ul>
      </section>
    </div>
  );
}
