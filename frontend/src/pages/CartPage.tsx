import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { CartSwitcher, BudgetBar } from '../components/cart/CartSwitcher';
import { Skeleton } from '../components/ui/Skeleton';

export function CartPage() {
  const { cart, loading, updateQty, removeItem, activeCartId, itemCount } = useCart();
  const items = cart?.items ?? [];
  const delivery = 0;

  if (loading && !cart?.id) return <Skeleton className="h-64 w-full" />;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'CART' }]} />
      <h1 className="page-title mt-4">Good choices.</h1>
      <p className="mt-2 text-muted">Your bag / {itemCount} items</p>

      <CartSwitcher />
      <BudgetBar cart={cart} />

      {items.length === 0 ? (
        <p className="mt-12 text-muted">
          Your bag is empty. <Link to="/browse" className="text-accent underline">Continue shopping</Link>
        </p>
      ) : (
        <>
          <div className="mt-10 hidden border-b border-border pb-3 text-xs uppercase tracking-widest text-muted md:grid md:grid-cols-[2fr_1fr_1fr_1fr]">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span className="text-right">Total</span>
          </div>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {items.map((item) => (
              <li key={item.variantId} className="grid gap-4 py-6 md:grid-cols-[2fr_1fr_1fr_1fr] md:items-center">
                <div className="flex gap-4">
                  {item.product.image && (
                    <img src={item.product.image} alt="" className="h-24 w-24 rounded-[8px] border border-border object-cover" />
                  )}
                  <div>
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-muted">{item.product.storeName}</p>
                    <button type="button" className="mt-2 text-xs text-muted hover:text-danger" onClick={() => removeItem(item.variantId)}>
                      Remove
                    </button>
                  </div>
                </div>
                <p className="text-sm">${item.unitPrice.toFixed(2)}</p>
                <div className="flex w-fit items-center rounded-[8px] border border-border">
                  <button type="button" className="px-3 py-2" onClick={() => updateQty(item.variantId, Math.max(1, item.quantity - 1))}>−</button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button type="button" className="px-3 py-2" onClick={() => updateQty(item.variantId, item.quantity + 1)}>+</button>
                </div>
                <p className="text-right font-medium">${item.lineTotal.toFixed(2)}</p>
              </li>
            ))}
          </ul>

          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div />
            <div className="card p-6">
              <div className="flex justify-between text-sm text-muted">
                <span>Subtotal</span>
                <span className="text-text">${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-muted">
                <span>Delivery</span>
                <span className="text-accent">{delivery === 0 ? 'Free' : `$${delivery}`}</span>
              </div>
              <div className="mt-4 flex justify-between border-t border-border pt-4 text-lg font-semibold">
                <span>Total</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <Link to={`/checkout/address${activeCartId ? `?cartId=${activeCartId}` : ''}`} className="btn-primary mt-6 w-full">
                Continue to checkout →
              </Link>
              <Link to="/cart/compare" className="btn-ghost mt-3 w-full text-center text-sm">Compare carts</Link>
            </div>
          </div>
        </>
      )}
      <Link to="/browse" className="mt-8 inline-block text-sm text-muted hover:text-accent">← Continue shopping</Link>
    </div>
  );
}
