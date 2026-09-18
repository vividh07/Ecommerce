import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../lib/api';
import type { Product } from '../types';
import { useAuth } from './AuthContext';

type WishlistState = {
  products: Product[];
  loading: boolean;
  refresh: () => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  moveToCart: (productId: string, cartId?: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistState | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setProducts([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/wishlist');
      setProducts(res.data.data ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isWishlisted = useCallback(
    (productId: string) => products.some((p) => p._id === productId),
    [products]
  );

  const toggle = useCallback(
    async (productId: string) => {
      if (!user) throw new Error('auth');
      if (isWishlisted(productId)) {
        const res = await api.delete(`/wishlist/${productId}`);
        setProducts(res.data.data ?? []);
      } else {
        const res = await api.post(`/wishlist/${productId}`);
        setProducts(res.data.data ?? []);
      }
    },
    [user, isWishlisted]
  );

  const moveToCart = useCallback(
    async (productId: string, cartId?: string) => {
      await api.post(`/wishlist/${productId}/move-to-cart`, { cartId });
      await refresh();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({ products, loading, refresh, isWishlisted, toggle, moveToCart }),
    [products, loading, refresh, isWishlisted, toggle, moveToCart]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
