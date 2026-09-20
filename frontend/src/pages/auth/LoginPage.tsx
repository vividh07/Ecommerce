import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  AuthAccentLink,
  AuthDivider,
  AuthField,
  AuthPrimaryButton,
  AuthShell,
  GoogleButton,
} from './AuthLayout';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/browse';

  const [email, setEmail] = useState(() => localStorage.getItem('shop.rememberEmail') ?? '');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem('shop.rememberEmail')));
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email.trim(), password);
      if (remember) localStorage.setItem('shop.rememberEmail', email.trim());
      else localStorage.removeItem('shop.rememberEmail');
      toast.success('Welcome back');
      navigate(from, { replace: true });
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
        <GoogleButton
          onClick={() => toast('Google sign-in is not configured yet.')}
        />
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
            <button
              type="button"
              className="text-muted underline decoration-white/30 underline-offset-4 transition hover:text-text hover:decoration-white"
              onClick={() => toast('Password reset is coming soon.')}
            >
              Forgot password?
            </button>
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
