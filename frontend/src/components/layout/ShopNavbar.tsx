import { Link, NavLink, useNavigate } from 'react-router-dom';
import { IconBag, IconHeart, IconSearch } from '../icons/Icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const nav = [
  { to: '/browse', label: 'Discover', dot: true },
  { to: '/browse?category=tech', label: 'Tech' },
  { to: '/browse?category=fashion', label: 'Fashion' },
  { to: '/browse', label: 'Home' },
];

export function ShopNavbar({ searchValue, onSearchChange }: { searchValue?: string; onSearchChange?: (v: string) => void }) {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-4 md:px-8">
        <Link to="/browse" className="wordmark shrink-0">Nexus</Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {nav.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm ${isActive ? 'text-text' : 'text-muted hover:text-text'}`
              }
            >
              {item.dot && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex max-w-md flex-1 items-center gap-3 md:ml-0 md:flex-none">
          <div className="relative hidden w-full min-w-[280px] md:block">
            <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search for products, brands, inspiration..."
              className="input-field rounded-full py-2.5 pl-10"
              value={searchValue ?? ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') navigate(`/browse?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
              }}
            />
          </div>
          {user ? (
            <Link to="/wishlist" className="rounded-full p-2 text-text hover:bg-white/5" aria-label="Wishlist">
              <IconHeart />
            </Link>
          ) : (
            <Link to="/login" className="rounded-full p-2 text-muted hover:text-text">
              <IconHeart />
            </Link>
          )}
          <Link to="/cart" className="relative rounded-full p-2 text-text hover:bg-white/5" aria-label="Cart">
            <IconBag />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; to?: string }[] }) {
  return (
    <p className="eyebrow">
      {items.map((item, i) => (
        <span key={item.label}>
          {item.to ? (
            <Link to={item.to} className="hover:text-text">{item.label}</Link>
          ) : (
            item.label
          )}
          {i < items.length - 1 ? ' / ' : ''}
        </span>
      ))}
    </p>
  );
}
