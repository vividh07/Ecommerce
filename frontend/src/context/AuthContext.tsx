import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, setTokens } from '../lib/api';
import { markSkipAuthFrom } from '../lib/authRedirect';
import type { SellerProfile, User } from '../types';

type AuthState = {
  user: User | null;
  seller: SellerProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
      setSeller(res.data.data.seller);
    } catch {
      setUser(null);
      setSeller(null);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }
    refreshProfile().finally(() => setLoading(false));
  }, [refreshProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: u, accessToken, refreshToken } = res.data.data;
    setTokens(accessToken, refreshToken);
    setUser(u);
    await refreshProfile();
    return u as User;
  }, [refreshProfile]);

  const register = useCallback(
    async (name: string, email: string, password: string, role = 'CUSTOMER') => {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { user: u, accessToken, refreshToken } = res.data.data;
      setTokens(accessToken, refreshToken);
      setUser(u);
      await refreshProfile();
      return u as User;
    },
    [refreshProfile]
  );

  const logout = useCallback(async () => {
    markSkipAuthFrom();
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    setTokens(null, null);
    setUser(null);
    setSeller(null);
  }, []);

  const value = useMemo(
    () => ({ user, seller, loading, login, register, logout, refreshProfile }),
    [user, seller, loading, login, register, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
