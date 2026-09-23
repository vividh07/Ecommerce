import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import {
  AuthDivider,
  AuthField,
  AuthPrimaryButton,
  AuthShell,
  AuthTextLink,
  GoogleButton,
} from './AuthLayout';

export function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const role = params.get('role') === 'seller' ? 'SELLER' : 'CUSTOMER';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onGoogle() {
    if (!agreed) {
      toast.error('Please agree to the Terms and Privacy Policy');
      return;
    }
    setGoogleLoading(true);
    try {
      const { requestGoogleAccessToken } = await import('../../lib/googleAuth');
      const accessToken = await requestGoogleAccessToken();
      await loginWithGoogle(accessToken, role);
      toast.success('Account ready');
      navigate(role === 'SELLER' ? '/seller' : '/browse', { replace: true });
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
    if (!agreed) {
      toast.error('Please agree to the Terms and Privacy Policy');
      return;
    }
    if (password.length < 8) {
      toast.error('Use at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, role);
      toast.success('Account created');
      navigate(role === 'SELLER' ? '/seller' : '/browse', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      panelHeadline="Find your everyday extra."
      panelSubline="Save what you love. Make it yours."
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Make it yours</p>
      <h1 className="auth-title mt-3">Your next favourite starts here.</h1>
      <p className="mt-3 text-[0.95rem] text-muted">A little account. A world of good finds.</p>

      <div className="mt-8 space-y-5">
        <GoogleButton onClick={onGoogle} disabled={googleLoading || loading} />
        <AuthDivider label="Or create an account with email" />

        <form onSubmit={onSubmit} className="space-y-5">
          <AuthField
            label="Full name"
            value={name}
            onChange={setName}
            placeholder="Alex Carter"
            autoComplete="name"
          />
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
            autoComplete="new-password"
            hint="Use at least 8 characters."
          />

          <label className="flex cursor-pointer items-start gap-2.5 text-sm text-muted">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-border bg-panel-2 accent-accent"
              required
            />
            <span>
              I agree to the{' '}
              <a href="#terms" className="text-text underline underline-offset-4">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-text underline underline-offset-4">
                Privacy Policy
              </a>
              .
            </span>
          </label>

          <AuthPrimaryButton loading={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </AuthPrimaryButton>
        </form>

        <p className="pt-1 text-center text-sm text-muted">
          Already have an account? <AuthTextLink to="/login">Sign in</AuthTextLink>
        </p>
      </div>
    </AuthShell>
  );
}
