import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { Skeleton } from '../components/ui/Skeleton';

export function CartComparePage() {
  const [params] = useSearchParams();
  const { duplicateCart, carts } = useCart();
  const [data, setData] = useState<any>(null);
  const left = params.get('left');
  const right = params.get('right');

  useEffect(() => {
    if (!left || !right) return;
    api.get('/carts/compare', { params: { left, right } }).then((r) => setData(r.data.data));
  }, [left, right]);

  if (!left || !right) {
    return (
      <div className="mx-auto max-w-lg card p-8 text-center">
        <h1 className="page-title text-4xl">Compare carts</h1>
        <p className="mt-3 text-muted">Duplicate a cart, edit the copy, then compare totals.</p>
        <button type="button" className="btn-primary mt-6" onClick={async () => {
          const base = carts[0];
          if (!base) return;
          const copy = await duplicateCart(base.id);
          if (copy) window.location.href = `/cart/compare?left=${base.id}&right=${copy.id}`;
        }}>Duplicate & compare</button>
      </div>
    );
  }

  if (!data) return <Skeleton className="h-96 w-full" />;

  return (
    <div>
      <Breadcrumbs items={[{ label: 'CART', to: '/cart' }, { label: 'COMPARE' }]} />
      <h1 className="page-title mt-4">Side by side.</h1>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {(['left', 'right'] as const).map((side) => {
          const block = data[side];
          const cheaper = data.highlights.cheaper === side;
          return (
            <div key={side} className={`card p-6 ${cheaper ? 'border-accent' : ''}`}>
              <h2 className="font-semibold">{block.cart.name}</h2>
              {cheaper && <p className="text-xs text-accent">Lower total</p>}
              <p className="mt-4 text-3xl font-bold">${block.totalWithDelivery.toFixed(2)}</p>
              <p className="text-sm text-muted">~{block.etaDays} day delivery</p>
            </div>
          );
        })}
      </div>
      <Link to="/cart" className="mt-8 inline-block text-accent">← Back to cart</Link>
    </div>
  );
}
