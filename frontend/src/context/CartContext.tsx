import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import type { Cart } from '../types';
import { useAuth } from './AuthContext';

const ACTIVE_KEY = 'activeCartId';

type CartState = {
  carts: Cart[];
  cart: Cart;
  activeCartId: string | null;
  loading: boolean;
  ready: boolean;
  itemCount: number;
  refresh: () => Promise<void>;
  selectCart: (cartId: string) => void;
  createCart: (name: string, budget?: number | null) => Promise<void>;
  duplicateCart: (cartId?: string) => Promise<Cart | null>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQty: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
};

const CartContext = createContext<CartState | null>(null);

const emptyCart: Cart = {
  id: '',
  name: 'Main',
  budget: null,
  budgetUsedPercent: null,
  overBudget: false,
  items: [],
  subtotal: 0,
};

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [carts, setCarts] = useState<Cart[]>([]);
  const [activeCartId, setActiveCartId] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_KEY)
  );
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('accessToken')));
  const [ready, setReady] = useState(false);

  const cart = useMemo(
    () => carts.find((c) => c.id === activeCartId) ?? carts[0] ?? null,
    [carts, activeCartId]
  );

  const refresh = useCallback(async () => {
    // Wait until auth bootstrap finishes so we don't treat "still loading" as logged out.
    if (authLoading) return;

    if (!user) {
      setCarts([]);
      setActiveCartId(null);
      localStorage.removeItem(ACTIVE_KEY);
      setLoading(false);
      setReady(true);
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/carts');
      const list: Cart[] = res.data.data ?? [];
      setCarts(list);
      const stored = localStorage.getItem(ACTIVE_KEY);
      const valid = list.find((c) => c.id === stored) ?? list[0] ?? null;
      if (valid) {
        setActiveCartId(valid.id);
        localStorage.setItem(ACTIVE_KEY, valid.id);
      } else {
        setActiveCartId(null);
        localStorage.removeItem(ACTIVE_KEY);
      }
    } catch {
      setCarts([]);
    } finally {
      setLoading(false);
      setReady(true);
    }
  }, [user, authLoading]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const selectCart = useCallback((cartId: string) => {
    setActiveCartId(cartId);
    localStorage.setItem(ACTIVE_KEY, cartId);
  }, []);

  const createCart = useCallback(
    async (name: string, budget?: number | null) => {
      const res = await api.post('/carts', { name, budget: budget ?? null });
      const created: Cart = res.data.data;
      await refresh();
      selectCart(created.id);
      toast.success(`Cart "${name}" created`);
    },
    [refresh, selectCart]
  );

  const duplicateCart = useCallback(
    async (cartId?: string) => {
      const id = cartId ?? activeCartId;
      if (!id) return null;
      const res = await api.post(`/carts/${id}/duplicate`);
      const copy: Cart = res.data.data;
      await refresh();
      toast.success('Cart duplicated for comparison');
      return copy;
    },
    [activeCartId, refresh]
  );

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      let id: string | null | undefined = activeCartId ?? cart?.id;
      if (!id) {
        await refresh();
        id = localStorage.getItem(ACTIVE_KEY);
      }
      if (!id) {
        toast.error('Cart is still loading — try again');
        return;
      }
      const res = await api.post(`/carts/${id}/items`, { variantId, quantity });
      const updated: Cart = res.data.data;
      setCarts((prev) => {
        const exists = prev.some((c) => c.id === updated.id);
        if (!exists) return [...prev, updated];
        return prev.map((c) => (c.id === updated.id ? updated : c));
      });
      setActiveCartId(updated.id);
      localStorage.setItem(ACTIVE_KEY, updated.id);
      toast.success('Added to cart');
    },
    [activeCartId, cart?.id, refresh]
  );

  const updateQty = useCallback(
    async (variantId: string, quantity: number) => {
      const id = activeCartId ?? cart?.id;
      if (!id) return;
      const res = await api.patch(`/carts/${id}/items/${variantId}`, { quantity });
      const updated: Cart = res.data.data;
      setCarts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    },
    [activeCartId, cart?.id]
  );

  const removeItem = useCallback(
    async (variantId: string) => {
      const id = activeCartId ?? cart?.id;
      if (!id) return;
      const res = await api.delete(`/carts/${id}/items/${variantId}`);
      const updated: Cart = res.data.data;
      setCarts((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      toast.success('Removed from cart');
    },
    [activeCartId, cart?.id]
  );

  const itemCount = useMemo(
    () => carts.reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0),
    [carts]
  );

  const value = useMemo(
    () => ({
      carts,
      cart: cart ?? emptyCart,
      activeCartId,
      loading: loading || authLoading,
      ready,
      itemCount,
      refresh,
      selectCart,
      createCart,
      duplicateCart,
      addItem,
      updateQty,
      removeItem,
    }),
    [
      carts,
      cart,
      activeCartId,
      loading,
      authLoading,
      ready,
      itemCount,
      refresh,
      selectCart,
      createCart,
      duplicateCart,
      addItem,
      updateQty,
      removeItem,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
