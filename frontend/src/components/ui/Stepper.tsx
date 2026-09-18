import { IconCheck } from '../icons/Icons';

type Step = { id: string; label: string };

type Props = {
  steps: Step[];
  current: number;
  variant?: 'checkout' | 'tracking';
};

export function Stepper({ steps, current, variant = 'checkout' }: Props) {
  return (
    <ol className={`flex items-center ${variant === 'tracking' ? 'justify-between gap-2' : 'gap-0'}`}>
      {steps.map((step, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <li key={step.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ${
                  done
                    ? 'border-accent bg-accent text-accent-fg'
                    : active
                      ? 'border-accent bg-accent text-accent-fg'
                      : 'border-border bg-transparent text-muted'
                }`}
              >
                {done ? <IconCheck className="h-4 w-4" /> : idx + 1}
              </div>
              <span className={`hidden text-xs sm:block ${active || done ? 'text-text' : 'text-muted'}`}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`mx-2 h-px flex-1 ${done ? 'bg-accent' : 'bg-border'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
