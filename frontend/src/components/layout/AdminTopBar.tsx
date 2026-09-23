import { useAuth } from '../../context/AuthContext';
import { IconChevronDown, IconSearch } from '../icons/Icons';
import { NotificationBell } from './NotificationBell';

export function AdminTopBar() {
  const { user } = useAuth();
  const initials = (user?.name ?? 'A')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="flex flex-wrap items-center gap-4 border-b border-border px-4 py-4 md:px-6">
      <div className="relative min-w-0 flex-1">
        <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          className="w-full rounded-full border border-border bg-[#111] py-2.5 pl-10 pr-4 text-sm outline-none placeholder:text-muted focus:border-accent/40"
          placeholder="Search products, orders, customers..."
        />
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell variant="admin" />
        <button type="button" className="flex items-center gap-2 rounded-full border border-border py-1.5 pl-1.5 pr-3 text-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d4ff3f] text-xs font-bold text-accent-fg">
            {initials}
          </span>
          <IconChevronDown className="h-3.5 w-3.5 text-muted" />
        </button>
      </div>
    </header>
  );
}
