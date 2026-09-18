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

type CartState = {
  cart: Cart | null;
  loading: boolean;
  itemCount: number;
  refresh: () => Promise<void>;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateQty: (variantId: string, quantity: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
};

const CartContext = createContext<CartState | null>(null);

const emptyCart: Cart = { id: '', items: [], subtotal: 0 };

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch {
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      const res = await api.post('/cart/items', { variantId, quantity });
      setCart(res.data.data);
      toast.success('Added to cart');
    },
    []
  );

  const updateQty = useCallback(async (variantId: string, quantity: number) => {
    const res = await api.patch(`/cart/items/${variantId}`, { quantity });
    setCart(res.data.data);
  }, []);

  const removeItem = useCallback(async (variantId: string) => {
    const res = await api.delete(`/cart/items/${variantId}`);
    setCart(res.data.data);
    toast.success('Removed from cart');
  }, []);

  const itemCount = useMemo(
    () => cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0,
    [cart]
  );

  const value = useMemo(
    () => ({ cart, loading, itemCount, refresh, addItem, updateQty, removeItem }),
    [cart, loading, itemCount, refresh, addItem, updateQty, removeItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
