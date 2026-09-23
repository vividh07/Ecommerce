import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconArrowUpRight, IconEye, IconEyeOff } from '../../components/icons/Icons';

const AUTH_ART = '/images/shop/artwork/auth-still-life.png';

export function AuthShell({
  panelHeadline,
  panelSubline,
  children,
}: {
  panelHeadline: string;
  panelSubline: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-bg text-text">
      <header className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-5 md:px-10 lg:px-12">
        <Link
          to="/browse"
          className="wordmark justify-self-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          LUMEN
        </Link>
        <p className="hidden text-center text-[11px] font-medium uppercase tracking-[0.28em] text-muted sm:block">
          Curated for everyday
        </p>
        <Link
          to="/browse"
          className="inline-flex items-center justify-self-end gap-1.5 text-sm text-text transition hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Back to shop
          <IconArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </header>

      <main className="mx-auto grid w-full max-w-[1440px] flex-1 grid-cols-1 gap-8 px-5 pb-6 md:px-10 lg:grid-cols-2 lg:items-stretch lg:gap-12 lg:px-12 lg:pb-8">
        <aside className="relative hidden min-h-[min(720px,calc(100vh-11rem))] overflow-hidden rounded-[24px] border border-border lg:block">
          <img
            src={AUTH_ART}
            alt=""
            width={1024}
            height={1536}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25" />
          <div className="absolute left-8 top-8 max-w-xs">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-white">
              The everyday, elevated.
            </p>
            <span className="mt-3 block h-px w-10 bg-white/80" />
          </div>
          <div className="absolute bottom-10 left-8 right-8 max-w-lg">
            <h2 className="font-display text-[2.75rem] uppercase leading-[0.95] tracking-[0.04em] text-white xl:text-[3.35rem]">
              {panelHeadline}
            </h2>
            <p className="mt-4 text-[1.05rem] font-medium text-white/90">{panelSubline}</p>
            <span className="mt-5 block h-px w-10 bg-white/70" />
          </div>
        </aside>

        <section className="flex flex-col justify-center py-6 lg:py-4 lg:pl-2 xl:pl-6">
          <div className="mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-[440px]">{children}</div>
        </section>
      </main>

      <footer className="flex shrink-0 items-center justify-between px-5 py-5 text-[11px] uppercase tracking-[0.14em] text-muted md:px-10 lg:px-12">
        <span>© LUMEN 2026</span>
        <nav className="flex items-center gap-2 sm:gap-3">
          <a href="#privacy" className="transition hover:text-text">
            Privacy
          </a>
          <span className="text-border-strong">/</span>
          <a href="#terms" className="transition hover:text-text">
            Terms
          </a>
          <span className="text-border-strong">/</span>
          <a href="#help" className="transition hover:text-text">
            Help
          </a>
        </nav>
      </footer>
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
  autoComplete,
  required = true,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (show ? 'text' : 'password') : type;

  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-text">{label}</label>
      <div className="relative">
        <input
          type={inputType}
          className="input-field pr-11"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
          >
            {show ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <span className="h-px flex-1 bg-border" />
      <span className="shrink-0 text-[10px] font-medium uppercase tracking-[0.18em] text-muted">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

export function GoogleButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className="btn-outline w-full gap-3 py-3.5"
      onClick={onClick}
      disabled={disabled}
    >
      <GoogleMark />
      {disabled ? 'Connecting to Google…' : 'Continue with Google'}
    </button>
  );
}

export function AuthPrimaryButton({
  children,
  loading,
}: {
  children: React.ReactNode;
  loading?: boolean;
}) {
  return (
    <button type="submit" className="btn-primary w-full py-3.5 text-[0.95rem]" disabled={loading}>
      {children}
      <IconArrowUpRight className="h-4 w-4" />
    </button>
  );
}

export function AuthAccentLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="font-medium text-accent underline decoration-accent/70 underline-offset-4 transition hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      {children}
    </Link>
  );
}

export function AuthTextLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="font-medium text-text underline decoration-white/40 underline-offset-4 transition hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
    >
      {children}
    </Link>
  );
}

function GoogleMark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.1 2.9-7 0-.7-.1-1.3-.2-1.9H12z"
      />
      <path
        fill="#34A853"
        d="M6.6 14.3l-.7.5-2.3 1.8C5.2 19.3 8.4 21.2 12 21.2c2.4 0 4.4-.8 5.9-2.1l-3.1-2.4c-.8.6-1.9.9-2.8.9-2.2 0-4-1.5-4.7-3.5z"
      />
      <path
        fill="#4A90E2"
        d="M3.6 7.4C2.9 8.8 2.5 10.3 2.5 12s.4 3.2 1.1 4.6l3-2.3c-.2-.6-.3-1.2-.3-2.3 0-.8.1-1.5.3-2.2L3.6 7.4z"
      />
      <path
        fill="#FBBC05"
        d="M12 4.8c1.3 0 2.5.5 3.4 1.3l2.6-2.6C16.4 2.1 14.4 1.2 12 1.2 8.4 1.2 5.2 3.1 3.6 6.2l3 2.3C7.3 6.4 9.1 4.8 12 4.8z"
      />
    </svg>
  );
}
