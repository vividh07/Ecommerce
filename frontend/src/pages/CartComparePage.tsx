import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { Skeleton } from '../components/ui/Skeleton';

type CompareData = {
  left: { cart: any; delivery: any[]; totalWithDelivery: number; etaDays: number };
  right: { cart: any; delivery: any[]; totalWithDelivery: number; etaDays: number };
  highlights: { cheaper: string; faster: string };
};

export function CartComparePage() {
  const [params] = useSearchParams();
  const { carts, duplicateCart, selectCart } = useCart();
  const [data, setData] = useState<CompareData | null>(null);
  const [loading, setLoading] = useState(false);

  const left = params.get('left');
  const right = params.get('right');

  useEffect(() => {
    if (!left || !right) return;
    setLoading(true);
    api
      .get('/carts/compare', { params: { left, right } })
      .then((res) => setData(res.data.data))
      .finally(() => setLoading(false));
  }, [left, right]);

  async function startCompare() {
    const base = carts[0];
    if (!base) return;
    const copy = await duplicateCart(base.id);
    if (!copy) return;
    selectCart(copy.id);
    window.location.href = `/cart/compare?left=${base.id}&right=${copy.id}`;
  }

  if (!left || !right) {
    return (
      <div className="mx-auto max-w-lg glass rounded-3xl p-8 text-center">
        <h1 className="font-display text-2xl font-bold">Compare carts</h1>
        <p className="mt-2 text-muted">Duplicate a cart, swap items in the copy, then compare totals and delivery.</p>
        <button type="button" className="btn-primary mt-6" onClick={startCompare}>
          Duplicate & compare
        </button>
      </div>
    );
  }

  if (loading || !data) return <Skeleton className="h-96 w-full" />;

  const cols = [
    { key: 'left', label: data.left.cart.name, side: data.left, hl: data.highlights },
    { key: 'right', label: data.right.cart.name, side: data.right, hl: data.highlights },
  ] as const;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-bold">Cart comparison</h1>
        <Link to="/cart" className="text-sm text-accent hover:underline">Edit carts</Link>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {cols.map(({ key, label, side }) => (
          <motion.div
            key={key}
            layout
            className={`glass rounded-2xl p-6 ${
              data.highlights.cheaper === key ? 'ring-2 ring-success/60' : ''
            } ${data.highlights.faster === key ? 'ring-2 ring-accent/40' : ''}`}
          >
            <h2 className="font-display text-xl font-semibold">{label}</h2>
            {data.highlights.cheaper === key && (
              <span className="mt-1 inline-block rounded-full bg-success/20 px-2 py-0.5 text-xs text-success">
                Lower total
              </span>
            )}
            {data.highlights.faster === key && data.highlights.cheaper !== key && (
              <span className="mt-1 ml-2 inline-block rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent">
                Faster delivery
              </span>
            )}
            <p className="mt-4 text-3xl font-bold text-accent">
              ${side.totalWithDelivery.toFixed(2)}
            </p>
            <p className="text-sm text-muted">
              Subtotal ${side.cart.subtotal.toFixed(2)} · ~{side.etaDays} days
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              {side.delivery.map((d: any) => (
                <li key={d.sellerId} className="flex justify-between">
                  <span>{d.storeName}</span>
                  <span>{d.fee === 0 ? 'Free ship' : `$${d.fee.toFixed(2)}`}</span>
                </li>
              ))}
            </ul>
            <ul className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
              {side.cart.items.map((item: any) => (
                <li key={item.variantId}>{item.product.name} × {item.quantity}</li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
