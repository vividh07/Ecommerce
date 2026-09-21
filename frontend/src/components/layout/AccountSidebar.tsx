import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  IconClose,
  IconHeart,
  IconHome,
  IconMapPin,
  IconMenu,
  IconOrders,
  IconSettings,
  IconSignOut,
} from '../icons/Icons';

const links = [
  { to: '/dashboard', label: 'Overview', icon: IconHome },
  { to: '/orders', label: 'My orders', icon: IconOrders },
  { to: '/wishlist', label: 'Wishlist', icon: IconHeart },
  { to: '/account/addresses', label: 'Addresses', icon: IconMapPin },
  { to: '/account/settings', label: 'Account settings', icon: IconSettings },
];

export function AccountSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function onSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    // Leave the protected route first so RequireAuth does not stash `from`.
    navigate('/login', { replace: true });
    try {
      await logout();
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <aside className="w-full shrink-0 lg:w-[220px]">
      <button
        type="button"
        className="mb-3 flex w-full items-center justify-between rounded-[8px] border border-border px-4 py-3 text-sm text-muted lg:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        Account menu
        {open ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
      </button>

      <nav className={`space-y-0.5 ${open ? 'block' : 'hidden'} lg:block`}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `relative flex items-center gap-3 rounded-r-[8px] py-3 pl-4 pr-3 text-sm transition ${
                  isActive
                    ? 'bg-panel text-text before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-full before:bg-accent'
                    : 'text-muted hover:text-text'
                }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              {link.label}
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={() => void onSignOut()}
          disabled={signingOut}
          className="flex w-full items-center gap-3 rounded-[8px] py-3 pl-4 pr-3 text-left text-sm text-muted hover:text-text disabled:opacity-60"
        >
          <IconSignOut className="h-4 w-4 shrink-0 opacity-80" />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </nav>
    </aside>
  );
}

export function AccountPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
      <AccountSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
