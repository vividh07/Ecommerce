import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api, type ApiListMeta } from '../lib/api';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { ProductCard } from '../components/products/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import type { Category, Product } from '../types';

export function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ApiListMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get('q') ?? '');
  const debouncedQ = useDebouncedValue(q);

  const categoryId = params.get('categoryId') ?? '';
  const sort = params.get('sort') ?? 'newest';
  const page = Number(params.get('page') ?? 1);

  useEffect(() => {
    api.get('/catalog/categories').then((res) => setCategories(res.data.data ?? []));
  }, []);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debouncedQ) next.set('q', debouncedQ);
    else next.delete('q');
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
  }, [debouncedQ]);

  useEffect(() => {
    setLoading(true);
    api
      .get('/catalog/products', {
        params: {
          q: params.get('q') || undefined,
          categoryId: categoryId || undefined,
          sort,
          page,
          limit: 12,
          minPrice: params.get('minPrice') || undefined,
          maxPrice: params.get('maxPrice') || undefined,
          minRating: params.get('minRating') || undefined,
        },
      })
      .then((res) => {
        setProducts(res.data.items ?? []);
        setMeta(res.data.meta ?? null);
      })
      .finally(() => setLoading(false));
  }, [params, categoryId, sort, page]);

  useEffect(() => {
    document.title = debouncedQ
      ? `Search: ${debouncedQ} | Nexus Market`
      : 'Browse | Nexus Market';
  }, [debouncedQ]);

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="glass h-fit rounded-2xl p-5 space-y-4">
        <h2 className="font-display text-lg font-semibold">Filters</h2>
        <div>
          <label className="mb-1 block text-xs text-muted">Category</label>
          <select
            className="input-field"
            value={categoryId}
            onChange={(e) => updateParam('categoryId', e.target.value)}
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-muted">Min $</label>
            <input
              type="number"
              className="input-field"
              value={params.get('minPrice') ?? ''}
              onChange={(e) => updateParam('minPrice', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">Max $</label>
            <input
              type="number"
              className="input-field"
              value={params.get('maxPrice') ?? ''}
              onChange={(e) => updateParam('maxPrice', e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Min rating</label>
          <select
            className="input-field"
            value={params.get('minRating') ?? ''}
            onChange={(e) => updateParam('minRating', e.target.value)}
          >
            <option value="">Any</option>
            <option value="4">4+ stars</option>
            <option value="3">3+ stars</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-muted">Sort</label>
          <select
            className="input-field"
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price ↑</option>
            <option value="price_desc">Price ↓</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </aside>

      <div>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-display text-3xl font-bold">Catalog</h1>
          <input
            type="search"
            placeholder="Search products..."
            className="input-field max-w-md"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted">No products match your filters.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
        {meta && meta.totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              type="button"
              disabled={!meta.hasPrev}
              className="btn-ghost disabled:opacity-40"
              onClick={() => updateParam('page', String(page - 1))}
            >
              Previous
            </button>
            <span className="flex items-center px-3 text-sm text-muted">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              type="button"
              disabled={!meta.hasNext}
              className="btn-ghost disabled:opacity-40"
              onClick={() => updateParam('page', String(page + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
