import { motion } from 'framer-motion';
import { useCart } from '../../context/CartContext';

export function CartSwitcher() {
  const { carts, activeCartId, selectCart, createCart } = useCart();

  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold">Your carts</h2>
        <button
          type="button"
          className="btn-ghost text-sm"
          onClick={() => {
            const name = window.prompt('Cart name');
            if (!name) return;
            const budgetStr = window.prompt('Budget (optional, USD)');
            const budget = budgetStr ? Number(budgetStr) : null;
            createCart(name, budget);
          }}
        >
          + New cart
        </button>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        {carts.map((c) => {
          const active = c.id === activeCartId;
          return (
            <motion.button
              key={c.id}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => selectCart(c.id)}
              className={`shrink-0 rounded-xl border px-4 py-2 text-left text-sm transition ${
                active
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-white/5 hover:bg-white/10'
              }`}
            >
              <span className="font-medium">{c.name}</span>
              <span className="mt-0.5 block text-xs text-muted">
                ${c.subtotal.toFixed(0)}
                {c.budget != null ? ` / $${c.budget}` : ''}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

export function BudgetBar({ cart }: { cart: { budget: number | null; budgetUsedPercent: number | null; overBudget: boolean; subtotal: number } }) {
  if (cart.budget == null) return null;
  const pct = cart.budgetUsedPercent ?? 0;
  const color = cart.overBudget ? 'bg-danger' : pct > 85 ? 'bg-amber-400' : 'bg-accent';

  return (
    <div className="mt-4">
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>Budget</span>
        <span>${cart.subtotal.toFixed(2)} / ${cart.budget.toFixed(2)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      {cart.overBudget && (
        <p className="mt-1 text-xs text-danger">Over budget by ${(cart.subtotal - cart.budget).toFixed(2)}</p>
      )}
    </div>
  );
}
