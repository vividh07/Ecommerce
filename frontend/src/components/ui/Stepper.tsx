import { IconCheck } from '../icons/Icons';

type Step = { id: string; label: string; detail?: string };

type Props = {
  steps: Step[];
  current: number;
  variant?: 'checkout' | 'tracking';
};

export function Stepper({ steps, current, variant = 'checkout' }: Props) {
  if (variant === 'tracking') {
    return (
      <ol className="relative flex w-full items-start justify-between gap-1">
        <div className="pointer-events-none absolute left-[12%] right-[12%] top-[14px] h-px bg-border" />
        <div
          className="pointer-events-none absolute left-[12%] top-[14px] h-px bg-[#d4ff3f] transition-all"
          style={{ width: `${Math.min(100, (current / Math.max(1, steps.length - 1)) * 76)}%` }}
        />
        {steps.map((step, idx) => {
          const done = idx < current;
          const active = idx === current;
          return (
            <li key={step.id} className="relative z-10 flex flex-1 flex-col items-center gap-2 text-center">
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                  done
                    ? 'bg-[#d4ff3f] text-accent-fg'
                    : active
                      ? 'bg-[#d4ff3f] text-accent-fg ring-4 ring-[#d4ff3f]/25'
                      : 'border border-border bg-bg text-muted'
                }`}
              >
                {done || active ? <IconCheck className="h-3.5 w-3.5" /> : null}
              </div>
              <span className={`text-xs font-medium ${active || done ? 'text-text' : 'text-muted'}`}>
                {step.label}
              </span>
              {step.detail ? <span className="max-w-[5.5rem] text-[10px] leading-tight text-muted">{step.detail}</span> : null}
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <ol className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const done = idx < current;
        const active = idx === current;
        return (
          <li key={step.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  done
                    ? 'border-[#d4ff3f] bg-[#d4ff3f] text-accent-fg'
                    : active
                      ? 'border-[#d4ff3f] bg-[#d4ff3f] text-accent-fg'
                      : 'border-border bg-transparent text-muted'
                }`}
              >
                {done ? <IconCheck className="h-3.5 w-3.5" /> : idx + 1}
              </div>
              <span className={`hidden text-xs sm:inline ${active || done ? 'text-text' : 'text-muted'}`}>
                {idx + 1}. {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`mx-2 h-px flex-1 sm:mx-3 ${done ? 'bg-[#d4ff3f]' : 'bg-border'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
