import type { ReactNode } from 'react';
import { productImageSrc } from '../../lib/productImage';

export function DemoBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-border bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted ${className}`}
    >
      Demo data
    </span>
  );
}

export function PageHeader({
  title,
  subtitle,
  badge = true,
  actions,
}: {
  title: string;
  subtitle?: string;
  badge?: boolean;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{title}</h1>
          {badge ? <DemoBadge /> : null}
        </div>
        {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  warn,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  warn?: boolean;
}) {
  return (
    <div className="panel p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted">
          {icon}
          <span>{label}</span>
        </div>
        <DemoBadge />
      </div>
      <p className={`mt-3 text-2xl font-semibold tracking-tight ${warn ? 'text-warning' : ''}`}>{value}</p>
      {sub ? <p className="mt-1 text-[11px] text-muted">{sub}</p> : null}
    </div>
  );
}

export function DotStatus({
  label,
  tone = 'neutral',
}: {
  label: string;
  tone?: 'success' | 'warning' | 'danger' | 'neutral' | 'lime';
}) {
  const dot =
    tone === 'success' || tone === 'lime'
      ? 'bg-[#d4ff3f]'
      : tone === 'warning'
        ? 'bg-warning'
        : tone === 'danger'
          ? 'bg-danger'
          : 'bg-muted';
  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export function Pagination({
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
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-5 py-4 text-sm text-muted">
      <p>{summary}</p>
      <div className="flex items-center gap-1">
        <button type="button" className="rounded-[6px] border border-border px-2 py-1" disabled={page <= 1}>
          ‹
        </button>
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`min-w-8 rounded-[6px] px-2 py-1 ${
              p === page ? 'bg-[#d4ff3f] font-semibold text-accent-fg' : 'border border-border'
            }`}
          >
            {p}
          </button>
        ))}
        <button type="button" className="rounded-[6px] border border-border px-2 py-1" disabled={page >= totalPages}>
          ›
        </button>
      </div>
    </div>
  );
}

export function Thumb({
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
        className={`${className} rounded-[8px] border border-border object-cover`}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center rounded-[8px] border border-border bg-panel-2 text-[10px] uppercase text-muted ${className}`}
    >
      {(label ?? '?').slice(0, 2)}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="px-5 py-12 text-center text-sm text-muted">{message}</div>
  );
}

export function formatShortDate(value?: string | Date | null) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function initials(name?: string | null) {
  return (name ?? 'U')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
