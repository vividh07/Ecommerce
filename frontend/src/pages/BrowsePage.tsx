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
  const debouncedQ = useDebouncedValue(params.get('q') ?? '');
  const { isWishlisted, toggle } = useWishlist();
  const [priceMax, setPriceMax] = useState(500);
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [inStock, setInStock] = useState(true);
  const page = Number(params.get('page') || 1);

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
          maxPrice: priceMax < 500 ? priceMax : undefined,
          sort: params.get('sort') || 'newest',
          limit: 24,
          page,
        },
      })
      .then((res) => setProducts(res.data.items ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchProducts();
  }, [params, selectedCats, priceMax, page]);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'DISCOVER' }]} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <h1 className="page-title-mixed max-w-2xl">
          Find your <span className="text-accent">next</span> favorite.
        </h1>
        <p className="eyebrow hidden md:block">Good things go further</p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
        <aside className="panel h-fit p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Filters</h2>
            <button
              type="button"
              className="text-xs text-muted hover:text-accent"
              onClick={() => {
                setSelectedCats([]);
                setPriceMax(500);
                setInStock(true);
              }}
            >
              Clear all
            </button>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <p className="text-sm font-medium">Category</p>
            <ul className="mt-3 space-y-2.5">
              {categories.map((c) => {
                const checked = selectedCats.includes(c._id);
                return (
                  <li key={c._id}>
                    <label className="flex cursor-pointer items-center gap-3 text-sm text-muted">
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

          <div className="mt-6 border-t border-border pt-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Price range</p>
              <span className="text-xs text-muted">Up to ${priceMax}</span>
            </div>
            <input
              type="range"
              min={20}
              max={500}
              step={10}
              value={priceMax}
              onChange={(e) => setPriceMax(Number(e.target.value))}
              className="mt-4 w-full accent-accent"
            />
            <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-muted">
              <span>$20</span>
              <span>$500+</span>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-5">
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-accent"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
              />
              In stock only
            </label>
          </div>

          <button type="button" className="btn-primary mt-6 w-full" onClick={fetchProducts}>
            Apply filters →
          </button>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <p className="text-sm text-muted">
              <span className="font-medium text-text">{products.length}</span> products
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {['Newest', 'Price ↑', 'Price ↓'].map((label) => (
                <button key={label} type="button" className="filter-chip text-xs">
                  {label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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

          <div className="mt-12 flex items-center justify-center gap-2">
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                className={`flex h-9 w-9 items-center justify-center rounded-[8px] text-sm ${
                  n === page ? 'bg-accent font-semibold text-accent-fg' : 'border border-border text-muted'
                }`}
                onClick={() => {
                  const next = new URLSearchParams(params);
                  next.set('page', String(n));
                  setParams(next);
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
