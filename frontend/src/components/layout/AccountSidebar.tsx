import { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  const [open, setOpen] = useState(false);

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
                    ? 'bg-[#141414] text-white before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-full before:bg-[#d4ff3f]'
                    : 'text-gray-400 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              {link.label}
            </NavLink>
          );
        })}
        <button
          type="button"
          onClick={() => logout()}
          className="flex w-full items-center gap-3 rounded-[8px] py-3 pl-4 pr-3 text-left text-sm text-gray-400 hover:text-white"
        >
          <IconSignOut className="h-4 w-4 shrink-0 opacity-80" />
          Sign out
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
