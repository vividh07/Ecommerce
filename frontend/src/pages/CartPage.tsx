import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { CartSwitcher } from '../components/cart/CartSwitcher';
import { Skeleton } from '../components/ui/Skeleton';

export function CartPage() {
  const { cart, loading, updateQty, removeItem, activeCartId, itemCount } = useCart();
  const items = cart?.items ?? [];
  const delivery = 0;
  const [promo, setPromo] = useState('');

  if (loading && !cart?.id) return <Skeleton className="h-64 w-full" />;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'CART' }]} />
      <h1 className="page-title mt-4">Good choices.</h1>
      <p className="mt-3 text-sm text-muted">Your bag · {itemCount} items</p>

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
          <div className="mt-10 hidden border-b border-border pb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted md:grid md:grid-cols-[minmax(0,2fr)_100px_120px_100px] md:gap-4">
            <span>Product</span>
            <span>Price</span>
            <span>Qty</span>
            <span className="text-right">Total</span>
          </div>
          <ul className="divide-y divide-border border-b border-border">
            {items.map((item) => (
              <li
                key={item.variantId}
                className="grid gap-4 py-8 md:grid-cols-[minmax(0,2fr)_100px_120px_100px] md:items-center md:gap-4"
              >
                <div className="flex gap-4">
                  {item.product.image && (
                    <img
                      src={item.product.image}
                      alt=""
                      className="h-28 w-28 shrink-0 rounded-[8px] border border-border object-cover bg-panel-2"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="mt-1 text-sm text-muted">{item.product.storeName}</p>
                    <button
                      type="button"
                      className="mt-3 text-xs text-muted underline hover:text-danger"
                      onClick={() => removeItem(item.variantId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <p className="text-sm md:text-base">${item.unitPrice.toFixed(2)}</p>
                <div className="qty-control w-fit">
                  <button type="button" onClick={() => updateQty(item.variantId, Math.max(1, item.quantity - 1))}>
                    −
                  </button>
                  <span className="w-10 text-center text-sm">{item.quantity}</span>
                  <button type="button" onClick={() => updateQty(item.variantId, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <p className="text-right font-semibold">${item.lineTotal.toFixed(2)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm font-semibold">Promo code</p>
              <p className="mt-1 text-sm text-muted">Have a code? Apply it before checkout.</p>
              <div className="mt-4 flex gap-2">
                <input
                  className="input-field flex-1"
                  placeholder="Enter code"
                  value={promo}
                  onChange={(e) => setPromo(e.target.value.toUpperCase())}
                />
                <button type="button" className="btn-outline shrink-0">Apply</button>
              </div>
              <p className="mt-2 text-xs text-muted">Try SAVE10 at payment.</p>
            </div>

            <div className="panel p-6 lg:max-w-md lg:ml-auto lg:w-full">
              <h2 className="text-sm font-semibold uppercase tracking-wider">Summary</h2>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-text">${cart.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Delivery</span>
                  <span className="font-medium text-accent">{delivery === 0 ? 'Free' : `$${delivery}`}</span>
                </div>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 text-xl font-semibold">
                <span>Total</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <Link
                to={`/checkout/address${activeCartId ? `?cartId=${activeCartId}` : ''}`}
                className="btn-primary mt-6 w-full"
              >
                Continue to checkout →
              </Link>
            </div>
          </div>
        </>
      )}

      <Link to="/browse" className="mt-10 inline-block text-sm text-muted hover:text-accent">
        ← Continue shopping
      </Link>
    </div>
  );
}
