import type { OrderStatus, StatusHistoryEntry } from '../../types';

const FALLBACK_NOTES: Record<string, string> = {
  PLACED: 'Order placed',
  CONFIRMED: 'Package collected',
  SHIPPED: 'Departed sorting centre',
  OUT_FOR_DELIVERY: 'In transit',
  DELIVERED: 'Delivered',
};

export function ShipmentTimeline({
  history,
  current,
}: {
  history: StatusHistoryEntry[];
  current: OrderStatus;
}) {
  const items = history.length
    ? [...history].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [
        {
          _id: '1',
          status: current,
          timestamp: new Date().toISOString(),
          note: FALLBACK_NOTES[current] ?? 'Order update',
        },
      ];

  return (
    <ol className="mt-6 space-y-0">
      {items.map((entry, idx) => {
        const active = idx === 0;
        const title =
          entry.note ||
          FALLBACK_NOTES[entry.status] ||
          entry.status.replace(/_/g, ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
        return (
          <li key={entry._id} className="relative flex gap-4 pb-6 last:pb-0">
            {idx < items.length - 1 ? (
              <span className="absolute left-[5px] top-3 bottom-0 w-px bg-border" />
            ) : null}
            <span
              className={`relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${
                active ? 'bg-[#d4ff3f] shadow-[0_0_0_4px_rgba(212,255,63,0.18)]' : 'bg-muted/50'
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${active ? 'text-text' : 'text-muted'}`}>{title}</p>
              <p className="mt-0.5 text-xs text-muted">
                {new Date(entry.timestamp).toLocaleString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
