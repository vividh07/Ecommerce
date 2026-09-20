import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { IconBag, IconBell, IconHeart } from '../components/icons/Icons';
import { Skeleton } from '../components/ui/Skeleton';
import { formatINR } from '../lib/money';
import type { Product } from '../types';

type StockMap = Record<string, { inStock: boolean; color?: string; subtitle?: string }>;

export function WishlistPage() {
  const { products, loading, moveToCart, toggle } = useWishlist();
  const { activeCartId, refresh } = useCart();
  const [stock, setStock] = useState<StockMap>({});

  useEffect(() => {
    if (!products.length) {
      setStock({});
      return;
    }
    let cancelled = false;
    Promise.all(
      products.map(async (p) => {
        try {
          const res = await api.get(`/catalog/products/${p._id}`);
          const variants = res.data.data?.variants ?? [];
          const inStock = variants.some((v: { stock: number }) => v.stock > 0);
          const first = variants[0];
          const attrs = first?.attributes ?? {};
          const color = attrs.color || attrs.Color;
          return [
            p._id,
            {
              inStock,
              color,
              subtitle: p.description?.split(/[.!]/)[0]?.trim() || undefined,
            },
          ] as const;
        } catch {
          return [p._id, { inStock: true }] as const;
        }
      })
    ).then((entries) => {
      if (!cancelled) setStock(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [products]);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/' }, { label: 'WISHLIST' }]} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Worth saving.</h1>
          <p className="mt-3 text-sm text-muted">Your wishlist.</p>
        </div>
        <p className="text-sm text-muted">
          {products.length} {products.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {loading ? (
        <Skeleton className="mt-10 h-48 w-full" />
      ) : products.length === 0 ? (
        <p className="mt-12 text-muted">
          <Link to="/browse" className="text-accent underline">
            Browse
          </Link>{' '}
          to save items.
        </p>
      ) : (
        <ul className="mt-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
          {products.map((p: Product) => {
            const meta = stock[p._id];
            const inStock = meta?.inStock !== false;
            return (
              <li key={p._id} className="panel flex flex-col overflow-hidden sm:flex-row">
                <Link
                  to={`/product/${p._id}`}
                  className="flex aspect-square shrink-0 items-center justify-center bg-[#151515] sm:w-[42%] sm:aspect-auto sm:min-h-[220px]"
                >
                  <img
                    src={p.images?.[0]}
                    alt=""
                    className="h-full w-full object-contain p-4"
                  />
                </Link>
                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold leading-snug">{p.name}</h2>
                      {meta?.subtitle && <p className="mt-1 text-sm text-muted">{meta.subtitle}</p>}
                      {meta?.color && (
                        <p className="mt-2 text-sm text-muted">Color: {meta.color}</p>
                      )}
                      <p className="mt-3 text-base font-semibold">{formatINR(p.basePrice)}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <button
                        type="button"
                        className={inStock ? 'text-danger' : 'text-muted'}
                        onClick={() => toggle(p._id)}
                        aria-label="Remove from wishlist"
                      >
                        <IconHeart className="h-5 w-5" filled={inStock} />
                      </button>
                      <button
                        type="button"
                        className="text-xs text-muted hover:text-text"
                        onClick={() => toggle(p._id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="mt-auto pt-6">
                    {!inStock && <p className="mb-2 text-sm text-warning">Out of stock</p>}
                    {inStock ? (
                      <button
                        type="button"
                        className="btn-primary w-full sm:max-w-[220px]"
                        onClick={async () => {
                          try {
                            await moveToCart(p._id, activeCartId ?? undefined);
                            await refresh();
                            toast.success('Added to bag');
                          } catch (err: unknown) {
                            const message =
                              (err as { response?: { data?: { message?: string } } })?.response?.data
                                ?.message ?? 'Could not add';
                            toast.error(message);
                          }
                        }}
                      >
                        <IconBag className="h-4 w-4" /> Add to bag
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-outline w-full sm:max-w-[220px]"
                        onClick={() => toast.success('We will notify you when it is back')}
                      >
                        <IconBell className="h-4 w-4" /> Notify me
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
