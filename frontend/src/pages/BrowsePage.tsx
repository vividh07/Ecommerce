import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { ProductCard } from '../components/products/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Skeleton';
import { IconChevronRight, IconClose, IconFilter } from '../components/icons/Icons';
import { useWishlist } from '../context/WishlistContext';
import { formatINRCompact } from '../lib/money';
import type { ApiListMeta } from '../lib/api';
import type { Category, Product } from '../types';

const PAGE_SIZE = 6;
const PRICE_CEILING = 50000;

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

function matchCategoryByName(categories: Category[], name: string | null) {
  if (!name) return null;
  const needle = name.trim().toLowerCase();
  return categories.find((c) => c.name.toLowerCase() === needle) ?? null;
}

export function BrowsePage() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<ApiListMeta | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const debouncedQ = useDebouncedValue(params.get('q') ?? '');
  const { isWishlisted, toggle } = useWishlist();

  const page = Math.max(1, Number(params.get('page') || 1));
  const sort = params.get('sort') || 'featured';
  const categorySlug = params.get('category');

  const [draftCatId, setDraftCatId] = useState<string | null>(null);
  const [draftPriceMax, setDraftPriceMax] = useState(PRICE_CEILING);
  const [draftInStock, setDraftInStock] = useState(true);
  const [appliedCatId, setAppliedCatId] = useState<string | null>(null);
  const [appliedPriceMax, setAppliedPriceMax] = useState(PRICE_CEILING);
  const [appliedInStock, setAppliedInStock] = useState(true);

  useEffect(() => {
    api.get('/catalog/categories').then((res) => setCategories(res.data.data ?? []));
  }, []);

  useEffect(() => {
    if (!categories.length) return;
    const fromQuery = matchCategoryByName(categories, categorySlug);
    const id = fromQuery?._id ?? null;
    setDraftCatId(id);
    setAppliedCatId(id);
  }, [categories, categorySlug]);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (debouncedQ) next.set('q', debouncedQ);
    else next.delete('q');
    if (next.toString() !== params.toString()) {
      setParams(next, { replace: true });
    }
  }, [debouncedQ]);

  useEffect(() => {
    setLoading(true);
    const sortParam = sort === 'featured' ? undefined : sort;
    api
      .get('/catalog/products', {
        params: {
          q: params.get('q') || undefined,
          categoryId: appliedCatId || undefined,
          maxPrice: appliedPriceMax < PRICE_CEILING ? appliedPriceMax : undefined,
          sort: sortParam,
          limit: PAGE_SIZE,
          page,
        },
      })
      .then((res) => {
        setProducts(res.data.items ?? []);
        setMeta(res.data.meta ?? null);
      })
      .finally(() => setLoading(false));
  }, [params, appliedCatId, appliedPriceMax, page, sort]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c._id, c.name));
    return map;
  }, [categories]);

  const selectedCategory = categories.find((c) => c._id === appliedCatId);

  const chips = useMemo(() => {
    const list: { key: string; label: string; clear: () => void }[] = [];
    if (selectedCategory) {
      list.push({
        key: 'cat',
        label: selectedCategory.name,
        clear: () => {
          setAppliedCatId(null);
          setDraftCatId(null);
          const next = new URLSearchParams(params);
          next.delete('category');
          next.delete('page');
          setParams(next);
        },
      });
    }
    if (appliedInStock) {
      list.push({
        key: 'stock',
        label: 'In stock only',
        clear: () => {
          setAppliedInStock(false);
          setDraftInStock(false);
        },
      });
    }
    if (appliedPriceMax < PRICE_CEILING) {
      list.push({
        key: 'price',
        label: `Up to ${formatINRCompact(appliedPriceMax)}`,
        clear: () => {
          setAppliedPriceMax(PRICE_CEILING);
          setDraftPriceMax(PRICE_CEILING);
        },
      });
    }
    return list;
  }, [selectedCategory, appliedInStock, appliedPriceMax, params, setParams]);

  function applyFilters() {
    setAppliedCatId(draftCatId);
    setAppliedPriceMax(draftPriceMax);
    setAppliedInStock(draftInStock);
    const next = new URLSearchParams(params);
    next.delete('page');
    const cat = categories.find((c) => c._id === draftCatId);
    if (cat) next.set('category', cat.name.toLowerCase());
    else next.delete('category');
    setParams(next);
    setFiltersOpen(false);
  }

  function clearAll() {
    setDraftCatId(null);
    setDraftPriceMax(PRICE_CEILING);
    setDraftInStock(true);
    setAppliedCatId(null);
    setAppliedPriceMax(PRICE_CEILING);
    setAppliedInStock(true);
    const next = new URLSearchParams(params);
    next.delete('category');
    next.delete('page');
    setParams(next);
  }

  function setSort(value: string) {
    const next = new URLSearchParams(params);
    if (value === 'featured') next.delete('sort');
    else next.set('sort', value);
    next.delete('page');
    setParams(next);
  }

  function goPage(n: number) {
    const next = new URLSearchParams(params);
    if (n <= 1) next.delete('page');
    else next.set('page', String(n));
    setParams(next);
  }

  const total = meta?.total ?? products.length;
  const totalPages = meta?.totalPages ?? 1;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '…')[] = [1];
    if (page > 3) pages.push('…');
    for (let n = Math.max(2, page - 1); n <= Math.min(totalPages - 1, page + 1); n++) {
      pages.push(n);
    }
    if (page < totalPages - 2) pages.push('…');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  }, [page, totalPages]);

  const filterPanel = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Filters</h2>
        <button type="button" className="text-xs text-muted hover:text-accent" onClick={clearAll}>
          Clear all
        </button>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-sm font-medium">Category</p>
        <ul className="mt-3 space-y-2.5">
          {categories.map((c) => {
            const checked = draftCatId === c._id;
            return (
              <li key={c._id}>
                <label className="flex cursor-pointer items-center gap-3 text-sm text-muted">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border accent-accent"
                    checked={checked}
                    onChange={() => setDraftCatId(checked ? null : c._id)}
                  />
                  <span className={checked ? 'text-text' : ''}>{c.name}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-sm font-medium">Price range (INR)</p>
        <input
          type="range"
          min={0}
          max={PRICE_CEILING}
          step={500}
          value={draftPriceMax}
          onChange={(e) => setDraftPriceMax(Number(e.target.value))}
          className="mt-4 w-full accent-accent"
        />
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-wider text-muted">
          <span>₹0</span>
          <span>₹{PRICE_CEILING.toLocaleString('en-IN')}</span>
        </div>
        <p className="mt-2 text-xs text-muted">Up to {formatINRCompact(draftPriceMax)}</p>
      </div>

      <div className="mt-6 border-t border-border pt-5">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-accent"
            checked={draftInStock}
            onChange={(e) => setDraftInStock(e.target.checked)}
          />
          In stock only
        </label>
      </div>

      <button type="button" className="btn-primary mt-6 w-full" onClick={applyFilters}>
        Apply filters <IconChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/' }, { label: 'DISCOVER' }]} />
      <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
        <h1 className="page-title-mixed max-w-xl">
          Find <span className="text-accent">YOUR</span> next favorite.
        </h1>
        <p className="eyebrow hidden items-center gap-3 md:flex">
          GOOD THINGS GO FURTHER
          <span className="inline-block h-px w-8 bg-accent" aria-hidden />
        </p>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr] lg:gap-10">
        <aside className="panel hidden h-fit p-6 lg:block">{filterPanel}</aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="btn-outline gap-2 px-3 py-2 text-xs lg:hidden"
                onClick={() => setFiltersOpen(true)}
              >
                <IconFilter className="h-4 w-4" /> Filters
              </button>
              <p className="text-sm text-muted">
                <span className="font-medium text-text">{total}</span> products
              </p>
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-text"
                  onClick={chip.clear}
                >
                  {chip.label}
                  <IconClose className="h-3 w-3" />
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              <span className="hidden sm:inline">Sort by</span>
              <select
                className="rounded-[8px] border border-border bg-panel-2 px-3 py-2 text-sm text-text outline-none"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <p className="py-16 text-center text-muted">No products match these filters.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  categoryLabel={(categoryMap.get(p.categoryId) ?? 'Catalog').toUpperCase()}
                  wishlisted={isWishlisted(p._id)}
                  onWishlistToggle={() => toggle(p._id).catch(() => {})}
                />
              ))}
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-1 items-center justify-center gap-1 sm:justify-start">
              <button
                type="button"
                className="pagination-link disabled:opacity-40"
                disabled={page <= 1}
                onClick={() => goPage(page - 1)}
                aria-label="Previous page"
              >
                ‹
              </button>
              {pageNumbers.map((n, i) =>
                n === '…' ? (
                  <span key={`e-${i}`} className="px-2 text-muted">
                    …
                  </span>
                ) : (
                  <button
                    key={n}
                    type="button"
                    className={`pagination-link ${n === page ? 'pagination-link-active' : ''}`}
                    onClick={() => goPage(n)}
                  >
                    {n}
                  </button>
                )
              )}
              <button
                type="button"
                className="pagination-link disabled:opacity-40"
                disabled={page >= totalPages}
                onClick={() => goPage(page + 1)}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
            <p className="w-full text-center text-xs text-muted sm:w-auto sm:text-right">
              Showing {from}–{to} of {total} products
            </p>
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-[16px] border border-border bg-bg p-6">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold">Filters</span>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close">
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      )}
    </div>
  );
}
