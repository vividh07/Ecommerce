import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { ProductCard } from '../components/products/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { useWishlist } from '../context/WishlistContext';
import type { Category, Product } from '../types';

export function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(params.get('q') ?? '');
  const debouncedQ = useDebouncedValue(q);
  const { isWishlisted, toggle } = useWishlist();
  const [minPrice, setMinPrice] = useState(params.get('minPrice') ?? '');
  const [maxPrice, setMaxPrice] = useState(params.get('maxPrice') ?? '');
  const [inStock, setInStock] = useState(true);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  useEffect(() => {
    api.get('/catalog/categories').then((res) => setCategories(res.data.data ?? []));
  }, []);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debouncedQ) next.set('q', debouncedQ);
    else next.delete('q');
    setParams(next, { replace: true });
  }, [debouncedQ]);

  function fetchProducts() {
    setLoading(true);
    api
      .get('/catalog/products', {
        params: {
          q: params.get('q') || undefined,
          categoryId: selectedCats[0] || params.get('categoryId') || undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          sort: params.get('sort') || 'newest',
          limit: 24,
        },
      })
      .then((res) => setProducts(res.data.items ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchProducts();
  }, [params, selectedCats, minPrice, maxPrice]);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'DISCOVER' }]} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <h1 className="page-title max-w-3xl">
          Find your <span className="text-accent">next</span> favorite.
        </h1>
        <p className="eyebrow hidden md:block">Good things go further</p>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="card h-fit p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            <button type="button" className="text-xs text-muted hover:text-accent" onClick={() => { setSelectedCats([]); setMinPrice(''); setMaxPrice(''); }}>
              Clear all
            </button>
          </div>
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-sm font-medium">Category</p>
            <ul className="mt-3 space-y-2">
              {categories.map((c) => {
                const checked = selectedCats.includes(c._id);
                return (
                  <li key={c._id}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-border accent-accent"
                        checked={checked}
                        onChange={() =>
                          setSelectedCats(checked ? selectedCats.filter((id) => id !== c._id) : [c._id])
                        }
                      />
                      {c.name}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-6 border-t border-border pt-4">
            <p className="text-sm font-medium">Price range</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input className="input-field" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <input className="input-field" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>
          <div className="mt-6 border-t border-border pt-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="accent-accent" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />
              In stock only
            </label>
          </div>
          <button type="button" className="btn-primary mt-6 w-full" onClick={fetchProducts}>
            Apply filters →
          </button>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <p className="text-sm text-muted">{products.length} products</p>
            <input
              className="input-field max-w-xs"
              placeholder="Search…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  wishlisted={isWishlisted(p._id)}
                  onWishlistToggle={() => toggle(p._id).catch(() => {})}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
