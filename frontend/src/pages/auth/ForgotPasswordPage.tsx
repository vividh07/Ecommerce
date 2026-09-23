import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import {
  AuthAccentLink,
  AuthField,
  AuthPrimaryButton,
  AuthShell,
} from './AuthLayout';

type Step = 'email' | 'reset';

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      toast.success(res.data.message || 'Check your email for a code');
      setStep('reset');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not send reset code';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function submitReset(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        password,
      });
      toast.success(res.data.message || 'Password updated');
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not reset password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function resendCode() {
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim() });
      toast.success(res.data.message || 'Code resent');
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Could not resend code';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell panelHeadline="Reset and return." panelSubline="A fresh start for your account.">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Security</p>
      <h1 className="auth-title mt-3">
        {step === 'email' ? 'Forgot your password?' : 'Enter the code.'}
      </h1>
      <p className="mt-3 text-[0.95rem] text-muted">
        {step === 'email'
          ? 'We will email a 6-digit code if that account exists.'
          : `Code sent to ${email}. It expires in 10 minutes.`}
      </p>

      {step === 'email' ? (
        <form onSubmit={(e) => void sendCode(e)} className="mt-8 space-y-5">
          <AuthField
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <AuthPrimaryButton loading={loading}>
            {loading ? 'Sending…' : 'Send reset code'}
          </AuthPrimaryButton>
        </form>
      ) : (
        <form onSubmit={(e) => void submitReset(e)} className="mt-8 space-y-5">
          <AuthField
            label="6-digit code"
            value={otp}
            onChange={setOtp}
            placeholder="123456"
            autoComplete="one-time-code"
          />
          <AuthField
            label="New password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            autoComplete="new-password"
          />
          <AuthField
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="Repeat password"
            autoComplete="new-password"
          />
          <AuthPrimaryButton loading={loading}>
            {loading ? 'Updating…' : 'Update password'}
          </AuthPrimaryButton>
          <button
            type="button"
            className="w-full text-center text-sm text-muted underline decoration-white/30 underline-offset-4 hover:text-text"
            disabled={loading}
            onClick={() => void resendCode()}
          >
            Resend code
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-muted">
        Remembered it? <AuthAccentLink to="/login">Back to sign in</AuthAccentLink>
      </p>
      {step === 'reset' ? (
        <p className="mt-2 text-center text-sm text-muted">
          Wrong email?{' '}
          <button
            type="button"
            className="text-accent underline underline-offset-4"
            onClick={() => {
              setStep('email');
              setOtp('');
              setPassword('');
              setConfirm('');
            }}
          >
            Change email
          </button>
        </p>
      ) : (
        <p className="mt-2 text-center text-sm text-muted">
          <Link to="/register" className="text-accent underline underline-offset-4">
            Create an account
          </Link>
        </p>
      )}
    </AuthShell>
  );
}
