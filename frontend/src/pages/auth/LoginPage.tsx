import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { clearSkipAuthFrom } from '../../lib/authRedirect';
import type { Role } from '../../types';
import {
  AuthAccentLink,
  AuthDivider,
  AuthField,
  AuthPrimaryButton,
  AuthShell,
  GoogleButton,
} from './AuthLayout';

function homeForRole(role: Role): string {
  if (role === 'ADMIN') return '/admin';
  if (role === 'SELLER') return '/seller';
  return '/';
}

function safeRedirectPath(pathname: string | undefined): string | null {
  if (!pathname) return null;
  if (pathname === '/login' || pathname === '/register') return null;
  return pathname;
}

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = safeRedirectPath(
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname
  );

  const [email, setEmail] = useState(() => localStorage.getItem('shop.rememberEmail') ?? '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem('shop.rememberEmail')));
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    clearSkipAuthFrom();
  }, []);

  async function onGoogle() {
    setGoogleLoading(true);
    try {
      const { requestGoogleAccessToken } = await import('../../lib/googleAuth');
      const accessToken = await requestGoogleAccessToken();
      const user = await loginWithGoogle(accessToken, 'CUSTOMER');
      toast.success('Welcome back');
      navigate(from ?? homeForRole(user.role), { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ??
        (err as { message?: string })?.message ??
        'Google sign-in failed';
      toast.error(message);
    } finally {
      setGoogleLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (remember) localStorage.setItem('shop.rememberEmail', email.trim());
      else localStorage.removeItem('shop.rememberEmail');
      toast.success('Welcome back');
      // Prefer role home after a clean logout; honor fresh deep-link `from` only.
      navigate(from ?? homeForRole(user.role), { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Login failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell panelHeadline="Good things. Waiting for you." panelSubline="Pick up where you left off.">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Your space</p>
      <h1 className="auth-title mt-3">Good to have you back.</h1>
      <p className="mt-3 text-[0.95rem] text-muted">Your favourites. Your orders. All right here.</p>

      <div className="mt-8 space-y-5">
        <GoogleButton onClick={onGoogle} disabled={googleLoading || loading} />
        <AuthDivider label="Or sign in with email" />

        <form onSubmit={onSubmit} className="space-y-5">
          <AuthField
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <AuthField
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="flex cursor-pointer items-center gap-2.5 text-text">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded border-border bg-panel-2 accent-accent"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-muted underline decoration-white/30 underline-offset-4 transition hover:text-text hover:decoration-white"
            >
              Forgot password?
            </Link>
          </div>

          <AuthPrimaryButton loading={loading}>{loading ? 'Signing in…' : 'Sign in'}</AuthPrimaryButton>
        </form>

        <p className="pt-1 text-center text-sm text-muted">
          New here? <AuthAccentLink to="/register">Create an account</AuthAccentLink>
        </p>
      </div>
    </AuthShell>
  );
}
