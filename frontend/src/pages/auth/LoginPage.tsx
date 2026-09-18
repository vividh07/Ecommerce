import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { AuthField, AuthLayout, AuthLink } from './AuthLayout';
import { IconChevronRight } from '../../components/icons/Icons';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back');
      navigate('/browse');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Hello again"
      title="Welcome back."
      subtitle="Sign in to continue to your account."
      footer={
        <>
          Don&apos;t have an account? <AuthLink to="/register">Create account</AuthLink>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@yourmail.com" />
        <AuthField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input type="checkbox" className="accent-accent" defaultChecked />
            Remember me
          </label>
          <AuthLink to="/login">Forgot password?</AuthLink>
        </div>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          Sign in <IconChevronRight />
        </button>
        <p className="text-center text-xs uppercase tracking-widest text-muted">Or continue with</p>
        <button type="button" className="btn-outline w-full">Continue with Google</button>
      </form>
    </AuthLayout>
  );
}
