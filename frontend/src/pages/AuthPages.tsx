import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

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
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Access your cart and orders">
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="input-field" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input-field" type="password" placeholder="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        New here? <Link to="/register" className="text-accent hover:underline">Create account</Link>
      </p>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(params.get('role') === 'seller' ? 'SELLER' : 'CUSTOMER');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password, role);
      toast.success('Account created');
      navigate(role === 'SELLER' ? '/seller' : '/');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Join Nexus Market" subtitle="Shop or sell on one platform">
      <form onSubmit={onSubmit} className="space-y-4">
        <input className="input-field" placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)} />
        <input className="input-field" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="input-field" type="password" placeholder="Password (8+ chars)" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="CUSTOMER">I want to shop</option>
          <option value="SELLER">I want to sell</option>
        </select>
        <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Creating…' : 'Create account'}</button>
      </form>
      <p className="mt-4 text-center text-sm text-muted">
        Already have an account? <Link to="/login" className="text-accent hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md glass rounded-3xl p-8">
      <h1 className="font-display text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-muted">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
