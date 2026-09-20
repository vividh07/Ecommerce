import { IconCheck, IconClock, IconTruck } from '../icons/Icons';

type Variant = 'shipped' | 'delivered' | 'processing' | 'paid' | 'pending' | 'default';

const outlineStyles: Record<Variant, { dot: string; text: string; border: string }> = {
  shipped: { dot: 'bg-[#d4ff3f]', text: 'text-[#d4ff3f]', border: 'border-[#d4ff3f]/50' },
  delivered: { dot: 'bg-white/70', text: 'text-white/80', border: 'border-white/25' },
  processing: { dot: 'bg-warning', text: 'text-warning', border: 'border-warning/50' },
  paid: { dot: 'bg-[#d4ff3f]', text: 'text-[#d4ff3f]', border: 'border-[#d4ff3f]/50' },
  pending: { dot: 'bg-warning', text: 'text-warning', border: 'border-warning/50' },
  default: { dot: 'bg-muted', text: 'text-muted', border: 'border-border' },
};

const filledStyles: Record<Variant, string> = {
  shipped: 'bg-[#d4ff3f] text-accent-fg',
  delivered: 'bg-[#6b8f71] text-white',
  processing: 'bg-warning text-accent-fg',
  paid: 'bg-[#d4ff3f] text-accent-fg',
  pending: 'bg-warning text-accent-fg',
  default: 'bg-white/15 text-text',
};

function StatusIcon({ variant }: { variant: Variant }) {
  if (variant === 'shipped') return <IconTruck className="h-3.5 w-3.5" />;
  if (variant === 'delivered') return <IconCheck className="h-3.5 w-3.5" />;
  if (variant === 'processing' || variant === 'pending') return <IconClock className="h-3.5 w-3.5" />;
  return null;
}

export function StatusBadge({
  label,
  variant = 'default',
  appearance = 'outline',
}: {
  label: string;
  variant?: Variant;
  appearance?: 'outline' | 'filled';
}) {
  if (appearance === 'filled') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${filledStyles[variant]}`}
      >
        <StatusIcon variant={variant} />
        {label}
      </span>
    );
  }

  const v = outlineStyles[variant];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${v.text} ${v.border}`}
    >
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

export function friendlyOrderStatus(status: string) {
  const s = status.toUpperCase();
  if (s === 'OUT_FOR_DELIVERY' || s === 'SHIPPED') return 'Shipped';
  if (s === 'DELIVERED') return 'Delivered';
  if (s === 'PLACED' || s === 'CONFIRMED') return 'Processing';
  if (s === 'CANCELLED') return 'Cancelled';
  if (s === 'RETURNED') return 'Returned';
  return status.replace(/_/g, ' ');
}
