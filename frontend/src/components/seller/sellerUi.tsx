import type { ReactNode } from 'react';
import { productImageSrc } from '../../lib/productImage';

export function SellerDemoBadge({ className = '', label = 'Demo' }: { className?: string; label?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-[#dbeafe] bg-[#eff6ff] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-[#1d4ed8] ${className}`}
    >
      {label}
    </span>
  );
}

export function SellerPageHeader({
  title,
  subtitle,
  badge,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-[#111] md:text-4xl">{title}</h1>
          {badge}
        </div>
        {subtitle ? <p className="mt-2 text-sm text-[#6b7280]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function SellerCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-[12px] border border-[#e5e5e5] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${className}`}>
      {children}
    </div>
  );
}

export function SellerStatCard({
  label,
  value,
  sub,
  icon,
  warn,
}: {
  label: string;
  value: string | number;
  sub?: ReactNode;
  icon?: ReactNode;
  warn?: boolean;
}) {
  return (
    <SellerCard className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-[#6b7280]">
          {icon}
          <span>{label}</span>
        </div>
      </div>
      <p className={`mt-3 text-2xl font-semibold tracking-tight ${warn ? 'text-[#dc2626]' : 'text-[#111]'}`}>{value}</p>
      {sub ? <div className="mt-1 text-[11px] text-[#6b7280]">{sub}</div> : null}
    </SellerCard>
  );
}

export function SellerDotStatus({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'lime' | 'info';
}) {
  const dot =
    tone === 'success' || tone === 'lime'
      ? 'bg-[#22c55e]'
      : tone === 'warning'
        ? 'bg-[#f59e0b]'
        : tone === 'danger'
          ? 'bg-[#ef4444]'
          : tone === 'info'
            ? 'bg-[#3b82f6]'
            : 'bg-[#9ca3af]';
  return (
    <span className="inline-flex items-center gap-2 text-sm text-[#111]">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function SellerPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'lime' | 'info';
}) {
  const styles =
    tone === 'success'
      ? 'bg-[#ecfdf5] text-[#047857]'
      : tone === 'lime'
        ? 'bg-[#f3fce0] text-[#3f6212]'
        : tone === 'warning'
          ? 'bg-[#fffbeb] text-[#b45309]'
          : tone === 'danger'
            ? 'bg-[#fef2f2] text-[#b91c1c]'
            : tone === 'info'
              ? 'bg-[#eff6ff] text-[#1d4ed8]'
              : 'bg-[#f3f4f6] text-[#4b5563]';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}>{children}</span>
  );
}

export function SellerThumb({
  src,
  alt = '',
  label,
  className = 'h-10 w-10',
}: {
  src?: string | null;
  alt?: string;
  label?: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={productImageSrc(src)}
        alt={alt}
        className={`${className} rounded-[8px] border border-[#e5e5e5] object-cover`}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-[8px] border border-[#e5e5e5] bg-[#f3f4f6] text-[10px] uppercase text-[#6b7280] ${className}`}
    >
      {(label ?? '?').slice(0, 2)}
    </div>
  );
}

export function SellerEmptyState({ message }: { message: string }) {
  return <div className="px-5 py-12 text-center text-sm text-[#6b7280]">{message}</div>;
}

export function SellerPagination({
  page,
  totalPages,
  summary,
}: {
  page: number;
  totalPages: number;
  summary?: ReactNode;
}) {
  const pages = Array.from({ length: Math.min(totalPages || 1, 5) }, (_, i) => i + 1);
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e5e5e5] px-5 py-4 text-sm text-[#6b7280]">
      <p>{summary}</p>
      <div className="flex items-center gap-1">
        <button type="button" className="rounded-[6px] border border-[#e5e5e5] px-2 py-1" disabled={page <= 1}>
          ‹
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`min-w-8 rounded-[6px] px-2 py-1 ${
              p === page ? 'bg-[#d4ff3f] font-semibold text-[#111]' : 'border border-[#e5e5e5]'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          type="button"
          className="rounded-[6px] border border-[#e5e5e5] px-2 py-1"
          disabled={page >= totalPages}
        >
          ›
        </button>
      </div>
    </div>
  );
}

export function sellerInputClass(extra = '') {
  return `w-full rounded-[8px] border border-[#e5e5e5] bg-white px-3.5 py-2.5 text-sm text-[#111] outline-none placeholder:text-[#9ca3af] focus:border-[#d4ff3f] ${extra}`;
}

export function sellerBtnPrimary(extra = '') {
  return `inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#d4ff3f] px-4 py-2.5 text-sm font-semibold text-[#111] transition hover:brightness-105 disabled:opacity-50 ${extra}`;
}

export function sellerBtnOutline(extra = '') {
  return `inline-flex items-center justify-center gap-2 rounded-[8px] border border-[#d4d4d4] bg-white px-4 py-2.5 text-sm font-medium text-[#111] transition hover:bg-[#fafafa] disabled:opacity-50 ${extra}`;
}

export function formatShortDate(iso?: string | null) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

export function initials(name?: string | null) {
  return (name ?? 'S')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
