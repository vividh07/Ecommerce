import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  IconChevronDown,
  IconChevronRight,
  IconClose,
  IconCreditCard,
  IconHome,
  IconMenu,
  IconOrders,
  IconPackage,
  IconReturn,
  IconSettings,
} from '../icons/Icons';
import { initials } from '../seller/sellerUi';

const links = [
  { to: '/seller', label: 'Overview', icon: IconHome, end: true },
  { to: '/seller/products', label: 'Products', icon: IconPackage },
  { to: '/seller/orders', label: 'Orders', icon: IconOrders },
  { to: '/seller/returns', label: 'Returns', icon: IconReturn },
  { to: '/seller/payouts', label: 'Payouts', icon: IconCreditCard },
  { to: '/seller/settings', label: 'Store settings', icon: IconSettings },
];

export function SellerSidebar({ storeName }: { storeName?: string }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const name = storeName || 'Your store';
  const userInitials = initials(user?.name);

  return (
    <aside className="flex w-full flex-col border-b border-white/10 bg-[#111111] text-white md:w-60 md:min-h-screen md:border-b-0 md:border-r md:border-white/10">
      <div className="flex items-center justify-between gap-3 px-4 py-5">
        <div>
          <p className="text-lg font-bold tracking-wide">SHOP</p>
          <p className="text-xs text-white/50">Seller Center</p>
        </div>
        <button
          type="button"
          className="rounded-[8px] border border-white/15 p-2 text-white/60 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle seller menu"
        >
          {open ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
        </button>
      </div>

      <div className={`${open ? 'block' : 'hidden'} md:flex md:flex-1 md:flex-col`}>
        <button
          type="button"
          className="mx-3 flex w-[calc(100%-1.5rem)] items-center justify-between rounded-[10px] border border-white/10 bg-[#1a1a1a] px-3 py-2.5 text-left"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#222] text-white/60">
              <IconHome className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="text-[11px] text-white/45">Active store</p>
            </div>
          </div>
          <IconChevronDown className="h-4 w-4 shrink-0 text-white/40" />
        </button>

        <nav className="mt-4 flex-1 space-y-1 px-3 pb-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm transition ${
                    isActive
                      ? 'bg-[#d4ff3f] font-semibold text-[#111]'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <Link
          to="/account/settings"
          className="mx-3 mb-4 flex items-center gap-3 rounded-[10px] border border-white/10 bg-[#1a1a1a] px-3 py-2.5"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d4ff3f] text-xs font-bold text-[#111]">
            {userInitials}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name ?? 'Seller'}</p>
            <p className="text-[11px] text-white/45">Seller</p>
          </div>
          <IconChevronRight className="h-4 w-4 shrink-0 text-white/40" />
        </Link>
      </div>
    </aside>
  );
}
