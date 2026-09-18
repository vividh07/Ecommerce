import type { OrderStatus, StatusHistoryEntry } from '../../types';

export function ShipmentTimeline({ history, current }: { history: StatusHistoryEntry[]; current: OrderStatus }) {
  const items = history.length ? history : [{ _id: '1', status: current, timestamp: new Date().toISOString(), note: 'Order placed' }];
  return (
    <ol className="mt-6 space-y-6 border-l border-border pl-6">
      {items.map((entry, idx) => {
        const active = idx === items.length - 1;
        return (
          <li key={entry._id} className="relative">
            <span
              className={`absolute -left-[1.55rem] top-1 h-3 w-3 rounded-full border ${
                active ? 'border-accent bg-accent' : 'border-border bg-bg'
              }`}
            />
            <p className="text-xs text-muted">{new Date(entry.timestamp).toLocaleString()}</p>
            <p className="font-medium">{entry.status.replace(/_/g, ' ')}</p>
            <p className="text-sm text-muted">{entry.note}</p>
          </li>
        );
      })}
    </ol>
  );
}
