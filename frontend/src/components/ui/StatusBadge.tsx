type Variant = 'shipped' | 'delivered' | 'processing' | 'paid' | 'pending' | 'default';

const styles: Record<Variant, { dot: string; text: string }> = {
  shipped: { dot: 'bg-success', text: 'text-success' },
  delivered: { dot: 'bg-muted', text: 'text-muted' },
  processing: { dot: 'bg-warning', text: 'text-warning' },
  paid: { dot: 'bg-success', text: 'text-success' },
  pending: { dot: 'bg-warning', text: 'text-warning' },
  default: { dot: 'bg-muted', text: 'text-muted' },
};

export function StatusBadge({ label, variant = 'default' }: { label: string; variant?: Variant }) {
  const v = styles[variant];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs font-medium ${v.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${v.dot}`} />
      {label}
    </span>
  );
}

export function orderStatusVariant(status: string): Variant {
  const s = status.toUpperCase();
  if (s.includes('SHIP') || s === 'OUT_FOR_DELIVERY') return 'shipped';
  if (s === 'DELIVERED') return 'delivered';
  if (s === 'PLACED' || s === 'CONFIRMED') return 'processing';
  if (s === 'PAID') return 'paid';
  if (s === 'PENDING') return 'pending';
  return 'default';
}
