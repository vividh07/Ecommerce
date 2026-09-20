import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  IconBag,
  IconClose,
  IconExternal,
  IconHome,
  IconMenu,
  IconOrders,
  IconPackage,
  IconSettings,
  IconUser,
  IconChevronDown,
} from '../icons/Icons';

const links = [
  { to: '/admin', label: 'Overview', icon: IconHome, end: true },
  { to: '/admin/products', label: 'Products', icon: IconPackage },
  { to: '/admin/orders', label: 'Orders', icon: IconOrders },
  { to: '/admin/inventory', label: 'Inventory', icon: IconBag },
  { to: '/admin/sellers', label: 'Customers', icon: IconUser },
  { to: '/admin/coupons', label: 'Discounts', icon: IconBag },
  { to: '/admin/reports', label: 'Reports', icon: IconOrders },
  { to: '/admin/settings', label: 'Settings', icon: IconSettings },
];

export function AdminSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <aside className="flex w-full flex-col border-b border-border bg-bg md:w-60 md:min-h-screen md:border-b-0 md:border-r">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
        <div>
          <p className="wordmark text-[1.05rem] tracking-[0.35em]">
            SHOP <span className="font-body text-[0.7rem] font-normal tracking-normal text-muted">| ADMIN</span>
          </p>
        </div>
        <button
          type="button"
          className="rounded-[8px] border border-border p-2 text-muted md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle admin menu"
        >
          {open ? <IconClose className="h-4 w-4" /> : <IconMenu className="h-4 w-4" />}
        </button>
      </div>

      <div className={`${open ? 'block' : 'hidden'} md:flex md:flex-1 md:flex-col`}>
        <button
          type="button"
          className="mx-3 mt-3 flex w-[calc(100%-1.5rem)] items-center justify-between rounded-[10px] border border-border bg-[#141414] px-3 py-2.5 text-left"
        >
          <div>
            <p className="text-sm font-medium">Demo store</p>
            <p className="text-[11px] text-muted">demo.shop.com</p>
          </div>
          <IconChevronDown className="h-4 w-4 text-muted" />
        </button>

        <nav className="mt-3 flex-1 space-y-0.5 px-2 pb-3">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 rounded-r-[8px] py-2.5 pl-3.5 pr-3 text-sm transition ${
                    isActive
                      ? 'bg-[#161616] text-white before:absolute before:left-0 before:top-1 before:bottom-1 before:w-[3px] before:rounded-full before:bg-[#d4ff3f]'
                      : 'text-muted hover:text-text'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        <Link
          to="/browse"
          className="flex items-center gap-2 border-t border-border px-4 py-4 text-xs text-muted hover:text-[#d4ff3f]"
        >
          View storefront
          <IconExternal className="h-3.5 w-3.5" />
        </Link>
      </div>
    </aside>
  );
}
