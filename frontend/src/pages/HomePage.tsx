import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { ProductCard } from '../components/products/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import type { Category, Product } from '../types';

export function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/catalog/products', { params: { limit: 5, sort: 'newest' } }),
      api.get('/catalog/categories'),
    ])
      .then(([productsRes, catRes]) => {
        setFeatured(productsRes.data.items ?? []);
        setCategories(catRes.data.data ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  const hero = featured[0];
  const side = featured.slice(1, 3);
  const grid = featured.slice(3);

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden rounded-3xl glass-strong p-8 md:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-2xl"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">Multi-vendor</p>
          <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl">
            Shop the future across <span className="gradient-text">curated storefronts</span>
          </h1>
          <p className="mt-4 text-lg text-muted">
            Discover gear from independent sellers, compare variants in real time, and checkout with Stripe.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/browse" className="btn-primary">Explore catalog</Link>
            <Link to="/shopping-room" className="btn-ghost">Shopping Room</Link>
          </div>
        </motion.div>
        <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-1/3 h-48 w-48 rounded-full bg-accent-2/20 blur-3xl" />
      </section>

      {categories.length > 0 && (
        <section className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c._id}
              to={`/browse?categoryId=${c._id}`}
              className="rounded-full border border-border bg-white/5 px-4 py-2 text-sm transition hover:border-accent/40 hover:text-accent"
            >
              {c.name}
            </Link>
          ))}
        </section>
      )}

      <section>
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold">Featured picks</h2>
          <Link to="/browse" className="text-sm text-accent hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-4 md:grid-rows-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid auto-rows-[minmax(180px,auto)] gap-4 md:grid-cols-4 md:grid-rows-2">
            {hero && (
              <div className="md:col-span-2 md:row-span-2">
                <ProductCard product={hero} large className="h-full" />
              </div>
            )}
            {side.map((p) => (
              <ProductCard key={p._id} product={p} className="md:col-span-1" />
            ))}
            {grid.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
