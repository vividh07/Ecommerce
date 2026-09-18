import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Skeleton } from '../components/ui/Skeleton';

export function CartPage() {
  const { cart, loading, updateQty, removeItem } = useCart();

  if (loading && !cart) {
    return <Skeleton className="h-64 w-full" />;
  }

  const items = cart?.items ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div>
        <h1 className="font-display text-3xl font-bold">Your cart</h1>
        {items.length === 0 ? (
          <p className="mt-6 text-muted">
            Cart is empty. <Link to="/browse" className="text-accent hover:underline">Browse products</Link>
          </p>
        ) : (
          <ul className="mt-6 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.li
                  key={item.variantId}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center"
                >
                  {item.product.image && (
                    <img src={item.product.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted">{item.product.storeName}</p>
                    <p className="text-sm text-muted">
                      {Object.entries(item.attributes).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      min={1}
                      max={item.stock}
                      value={item.quantity}
                      onChange={(e) => updateQty(item.variantId, Number(e.target.value))}
                      className="input-field w-16"
                    />
                    <p className="w-20 text-right font-medium">${item.lineTotal.toFixed(2)}</p>
                    <button
                      type="button"
                      className="text-sm text-danger hover:underline"
                      onClick={() => removeItem(item.variantId)}
                    >
                      Remove
                    </button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
      <aside className="glass h-fit rounded-2xl p-6">
        <h2 className="font-display text-xl font-semibold">Summary</h2>
        <div className="mt-4 flex justify-between text-muted">
          <span>Subtotal</span>
          <span className="text-text">${(cart?.subtotal ?? 0).toFixed(2)}</span>
        </div>
        <p className="mt-2 text-xs text-muted">Taxes and shipping calculated at checkout.</p>
        <Link
          to="/checkout"
          className={`btn-primary mt-6 w-full text-center ${items.length === 0 ? 'pointer-events-none opacity-50' : ''}`}
        >
          Checkout
        </Link>
      </aside>
    </div>
  );
}
