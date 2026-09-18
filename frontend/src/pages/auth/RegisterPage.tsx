import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { AuthField, AuthLayout, AuthLink } from './AuthLayout';
import { IconChevronRight } from '../../components/icons/Icons';

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
      navigate(role === 'SELLER' ? '/seller' : '/browse');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="Join Nexus"
      title="Your next favorite starts here."
      subtitle="Create an account to get started."
      footer={
        <>
          Already have an account? <AuthLink to="/login">Sign in</AuthLink>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField label="Full name" value={name} onChange={setName} placeholder="Alex Carter" />
        <AuthField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@yourmail.com" />
        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="••••••••"
          hint="Use at least 8 characters with a mix of letters, numbers and symbols."
        />
        <select className="input-field" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="CUSTOMER">I want to shop</option>
          <option value="SELLER">I want to sell</option>
        </select>
        <label className="flex gap-2 text-xs text-muted">
          <input type="checkbox" className="mt-0.5 accent-accent" required />
          I agree to the Terms of Service and Privacy Policy
        </label>
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          Create account <IconChevronRight />
        </button>
        <button type="button" className="btn-outline w-full">Continue with Google</button>
      </form>
    </AuthLayout>
  );
}
