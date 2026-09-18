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
    <aside className="w-full shrink-0 lg:w-[220px]">
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `relative block rounded-lg py-3 pl-4 text-sm transition ${
                isActive
                  ? 'bg-[#141414] text-white before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-[#d4ff3f]'
                  : 'text-gray-400 hover:text-white'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => logout()}
          className="block w-full rounded-lg py-3 pl-4 text-left text-sm text-gray-400 hover:text-white"
        >
          Sign out
        </button>
      </nav>
    </aside>
  );
}

export function AccountPageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-10 lg:flex-row lg:gap-14">
      <AccountSidebar />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
