import { Link } from 'react-router-dom';
import { ShopNavbar } from '../../components/layout/ShopNavbar';

const HERO =
  'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200&q=80';

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <ShopNavbar />
      <div className="grid min-h-[calc(100vh-72px)] lg:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r border-border lg:block">
          <img src={HERO} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-transparent to-bg/30" />
          <p className="absolute left-8 top-8 eyebrow text-text/90">Good things go further</p>
          <p className="absolute bottom-10 left-8 max-w-xs text-sm leading-relaxed text-text/80">
            Curated for a brighter tomorrow
          </p>
        </div>
        <div className="flex flex-col justify-center px-6 py-14 md:px-16 lg:px-20">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="auth-title mt-3">{title}</h1>
          <p className="mt-4 text-muted">{subtitle}</p>
          <div className="mt-8 max-w-md">{children}</div>
          <div className="mt-8 max-w-md text-sm text-muted">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text">{label}</label>
      <input
        type={type}
        className="input-field"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function AuthLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="font-medium text-text underline decoration-accent underline-offset-4 hover:text-accent">
      {children}
    </Link>
  );
}
