import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Overview', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/sellers', label: 'Sellers' },
  { to: '/admin/coupons', label: 'Discounts' },
];

export function AdminSidebar() {
  return (
    <aside className="flex w-full flex-col border-r border-border bg-bg md:w-60 md:min-h-[calc(100vh-0px)]">
      <div className="border-b border-border p-4">
        <p className="text-xs text-muted">Demo store</p>
        <p className="text-sm font-medium">nexus.market</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `block rounded-[8px] px-3 py-2.5 text-sm ${
                isActive ? 'bg-surface-2 text-accent' : 'text-muted hover:bg-white/5 hover:text-text'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <Link to="/browse" className="border-t border-border p-4 text-xs text-muted hover:text-accent">
        View storefront →
      </Link>
    </aside>
  );
}
