import { motion } from 'framer-motion';
import type { OrderStatus, StatusHistoryEntry } from '../../types';

const FLOW: OrderStatus[] = [
  'PLACED',
  'CONFIRMED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

type Props = {
  current: OrderStatus;
  history: StatusHistoryEntry[];
};

export function OrderTimeline({ current, history }: Props) {
  if (current === 'CANCELLED' || current === 'RETURNED') {
    return (
      <div className="glass rounded-2xl p-5 text-center text-danger">
        Order {current.toLowerCase().replace('_', ' ')}
      </div>
    );
  }

  const currentIdx = FLOW.indexOf(current);

  return (
    <ol className="relative space-y-0">
      {FLOW.map((step, idx) => {
        const done = idx <= currentIdx;
        const entry = history.filter((h) => h.status === step).pop();
        return (
          <li key={step} className="flex gap-4 pb-8 last:pb-0">
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: done ? 1 : 0.85 }}
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  done ? 'border-accent bg-accent/20 text-accent' : 'border-border text-muted'
                }`}
              >
                {idx + 1}
              </motion.div>
              {idx < FLOW.length - 1 && (
                <div className={`mt-1 w-0.5 flex-1 min-h-[2rem] ${done ? 'bg-accent/50' : 'bg-border'}`} />
              )}
            </div>
            <div className="pt-1">
              <p className={`font-medium ${done ? 'text-text' : 'text-muted'}`}>
                {step.replace(/_/g, ' ')}
              </p>
              {entry && (
                <p className="text-xs text-muted">
                  {new Date(entry.timestamp).toLocaleString()} — {entry.note}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
