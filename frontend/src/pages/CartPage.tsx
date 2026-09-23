import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { CartSwitcher } from '../components/cart/CartSwitcher';
import { IconBookmark, IconTrash } from '../components/icons/Icons';
import { Skeleton } from '../components/ui/Skeleton';
import { formatINR } from '../lib/money';
import { useWishlist } from '../context/WishlistContext';
import toast from 'react-hot-toast';

const SWATCH: Record<string, string> = {
  silver: '#c0c0c0',
  charcoal: '#2f2f2f',
  orange: '#e85d04',
  olive: '#556b2f',
  white: '#f5f5f5',
};

function colorOf(attrs: Record<string, string>) {
  return attrs?.color || attrs?.Color || null;
}

export function CartPage() {
  const { cart, loading, ready, updateQty, removeItem, refresh, itemCount, activeCartId } = useCart();
  const { toggle } = useWishlist();
  const items = cart?.items ?? [];
  const delivery = 0;
  const [promo, setPromo] = useState('');

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!ready || loading) {
    return (
      <div className="mt-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/' }, { label: 'CART' }]} />
      <h1 className="page-title mt-4">Good choices.</h1>
      <p className="mt-3 text-sm text-muted">
        Your bag / {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </p>

      <details className="mt-6 text-sm text-muted">
        <summary className="cursor-pointer hover:text-text">Multiple carts</summary>
        <div className="mt-3">
          <CartSwitcher />
        </div>
      </details>

      {items.length === 0 ? (
        <p className="mt-16 text-muted">
          Your bag is empty.{' '}
          <Link to="/browse" className="text-accent underline">
            Continue shopping
          </Link>
        </p>
      ) : (
        <>
          <div className="mt-10 hidden border-b border-border pb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted md:grid md:grid-cols-[minmax(0,2fr)_110px_140px_110px] md:gap-4">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span className="text-right">Total</span>
          </div>
          <ul className="divide-y divide-border border-b border-border">
            {items.map((item) => {
              const color = colorOf(item.attributes);
              return (
                <li
                  key={item.variantId}
                  className="grid gap-4 py-8 md:grid-cols-[minmax(0,2fr)_110px_140px_110px] md:items-start md:gap-4"
                >
                  <div className="flex gap-4">
                    <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-border bg-[#151515]">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt=""
                          className="h-full w-full object-contain p-2"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold">{item.product.name}</p>
                      <p className="mt-1 text-sm text-muted">{item.product.storeName}</p>
                      {color && (
                        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                          Color: {color}
                          <span
                            className="inline-block h-3 w-3 rounded-full border border-border"
                            style={{ backgroundColor: SWATCH[color.toLowerCase()] ?? '#888' }}
                          />
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted md:hidden">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 hover:text-danger"
                          onClick={() => removeItem(item.variantId)}
                        >
                          <IconTrash /> Remove
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 hover:text-text"
                          onClick={async () => {
                            try {
                              await toggle(item.product.id);
                              await removeItem(item.variantId);
                              toast.success('Saved for later');
                            } catch {
                              toast.error('Sign in to save items');
                            }
                          }}
                        >
                          <IconBookmark /> Save for later
                        </button>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm md:pt-1 md:text-base">{formatINR(item.unitPrice)}</p>
                  <div>
                    <div className="qty-control w-fit">
                      <button
                        type="button"
                        onClick={() => updateQty(item.variantId, Math.max(1, item.quantity - 1))}
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm">{item.quantity}</span>
                      <button type="button" onClick={() => updateQty(item.variantId, item.quantity + 1)}>
                        +
                      </button>
                    </div>
                    <div className="mt-4 hidden flex-wrap gap-4 text-xs text-muted md:flex">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 hover:text-danger"
                        onClick={() => removeItem(item.variantId)}
                      >
                        <IconTrash /> Remove
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 hover:text-text"
                        onClick={async () => {
                          try {
                            await toggle(item.product.id);
                            await removeItem(item.variantId);
                            toast.success('Saved for later');
                          } catch {
                            toast.error('Sign in to save items');
                          }
                        }}
                      >
                        <IconBookmark /> Save for later
                      </button>
                    </div>
                  </div>
                  <p className="text-right font-semibold md:pt-1">{formatINR(item.lineTotal)}</p>
                </li>
              );
            })}
          </ul>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-semibold">Promo code</p>
              <div className="mt-4 flex overflow-hidden rounded-[8px] border border-border">
                <input
                  className="min-w-0 flex-1 bg-panel-2 px-4 py-3 text-sm outline-none placeholder:text-muted"
                  placeholder="Enter promo code"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value.toUpperCase())}
                />
                <button type="button" className="shrink-0 border-l border-border px-5 text-sm font-medium hover:bg-white/5">
                  Apply
                </button>
              </div>
            </div>

            <div className="lg:ml-auto lg:w-full lg:max-w-md">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-text">{formatINR(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Delivery</span>
                  <span className="font-medium text-accent">{delivery === 0 ? 'Free' : formatINR(delivery)}</span>
                </div>
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
                <div>
                  <p className="text-sm text-muted">Total</p>
                  <p className="text-xs text-muted">Taxes included</p>
                </div>
                <p className="text-2xl font-semibold">{formatINR(cart.subtotal)}</p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
            <Link to="/browse" className="text-sm text-text hover:text-accent">
              ← Continue shopping
            </Link>
            <Link
              to={`/checkout/address${activeCartId ? `?cartId=${activeCartId}` : ''}`}
              className="btn-primary"
            >
              Continue to checkout →
            </Link>
          </div>
        </>
      )}

      {items.length === 0 && (
        <Link to="/browse" className="mt-10 inline-block text-sm text-muted hover:text-accent">
          ← Continue shopping
        </Link>
      )}
    </div>
  );
}
