import { useCart } from '../../context/CartContext';

export function CartSwitcher() {
  const { carts, activeCartId, selectCart, createCart } = useCart();

  return (
    <div className="card mt-6 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest">Named carts</h2>
        <button
          type="button"
          className="text-sm text-accent hover:underline"
          onClick={() => {
            const name = window.prompt('Cart name');
            if (!name) return;
            const budgetStr = window.prompt('Budget (optional)');
            createCart(name, budgetStr ? Number(budgetStr) : null);
          }}
        >
          + New cart
        </button>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {carts.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => selectCart(c.id)}
            className={`shrink-0 rounded-[8px] border px-4 py-2 text-left text-sm ${
              c.id === activeCartId ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted'
            }`}
          >
            <span className="font-medium">{c.name}</span>
            <span className="block text-xs">${c.subtotal.toFixed(0)}{c.budget != null ? ` / $${c.budget}` : ''}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function BudgetBar({ cart }: { cart: { budget: number | null; budgetUsedPercent: number | null; overBudget: boolean; subtotal: number } }) {
  if (cart.budget == null) return null;
  const pct = cart.budgetUsedPercent ?? 0;
  return (
    <div className="mt-4">
      <div className="mb-1 flex justify-between text-xs text-muted">
        <span>Budget</span>
        <span>${cart.subtotal.toFixed(2)} / ${cart.budget.toFixed(2)}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
        <div className={`h-full ${cart.overBudget ? 'bg-danger' : 'bg-accent'}`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
