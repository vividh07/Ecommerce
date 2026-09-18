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
      <div className="grid min-h-[calc(100vh-73px)] lg:grid-cols-2">
        <div className="relative hidden overflow-hidden border-r border-border lg:block">
          <img src={HERO} alt="" className="h-full w-full object-cover opacity-90" />
          <p className="absolute left-8 top-8 eyebrow max-w-[12rem] text-text/80">Good things go further</p>
          <p className="absolute bottom-8 left-8 eyebrow max-w-[14rem] text-text/80">Curated for a brighter tomorrow</p>
        </div>
        <div className="flex flex-col justify-center px-6 py-12 md:px-16 lg:px-20">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 font-display text-5xl uppercase leading-none md:text-6xl">{title}</h1>
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
      <label className="mb-2 block text-sm font-medium">{label}</label>
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
    <Link to={to} className="text-text underline decoration-accent underline-offset-4 hover:text-accent">
      {children}
    </Link>
  );
}
