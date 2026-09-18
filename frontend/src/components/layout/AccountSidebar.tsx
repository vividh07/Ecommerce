import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/orders', label: 'My orders' },
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/account/addresses', label: 'Addresses' },
  { to: '/account/settings', label: 'Account settings' },
];

export function AccountSidebar() {
  const { logout } = useAuth();
  return (
    <aside className="w-full shrink-0 md:w-56">
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `relative block rounded-[8px] px-4 py-3 text-sm transition ${
                isActive
                  ? 'bg-surface-2 text-text before:absolute before:left-0 before:top-2 before:bottom-2 before:w-1 before:rounded-full before:bg-accent'
                  : 'text-muted hover:text-text'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
        <button type="button" onClick={() => logout()} className="btn-ghost w-full justify-start px-4 text-left">
          Sign out
        </button>
      </nav>
    </aside>
  );
}
