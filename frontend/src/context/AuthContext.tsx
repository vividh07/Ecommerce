import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { api, clearSession, setTokens } from '../lib/api';
import { markSkipAuthFrom } from '../lib/authRedirect';
import { disconnectSocket } from '../lib/socket';
import type { SellerProfile, User } from '../types';

type AuthState = {
  user: User | null;
  seller: SellerProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, role?: string) => Promise<User>;
  loginWithGoogle: (accessToken: string, role?: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<boolean>;
};

const AuthContext = createContext<AuthState | null>(null);

const BOOTSTRAP_MS = 12_000;

function wipeLocalSession() {
  clearSession();
  disconnectSocket();
  localStorage.removeItem('activeCartId');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data.user);
      setSeller(res.data.data.seller);
      return true;
    } catch {
      wipeLocalSession();
      setUser(null);
      setSeller(null);
      return false;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (cancelled) return;
      // Backend down / hung refresh — drop stale session so the UI can recover.
      wipeLocalSession();
      setUser(null);
      setSeller(null);
      setLoading(false);
    }, BOOTSTRAP_MS);

    refreshProfile().finally(() => {
      if (cancelled) return;
      window.clearTimeout(timeout);
      setLoading(false);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
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

  const loginWithGoogle = useCallback(
    async (accessToken: string, role = 'CUSTOMER') => {
      const res = await api.post('/auth/google', { accessToken, role });
      const { user: u, accessToken: at, refreshToken } = res.data.data;
      setTokens(at, refreshToken);
      setUser(u);
      const ok = await refreshProfile();
      if (!ok) setUser(u);
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
    wipeLocalSession();
    setUser(null);
    setSeller(null);
  }, []);

  const value = useMemo(
    () => ({ user, seller, loading, login, register, loginWithGoogle, logout, refreshProfile }),
    [user, seller, loading, login, register, loginWithGoogle, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
