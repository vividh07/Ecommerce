import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { IconBag, IconHeart, IconSearch } from '../icons/Icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const CATEGORIES = [
  { label: 'Discover', to: '/browse', featured: true },
  { label: 'Tech', to: '/browse?category=tech' },
  { label: 'Fashion', to: '/browse?category=fashion' },
  { label: 'Home', to: '/browse?category=home' },
  { label: 'Beauty', to: '/browse?category=beauty' },
  { label: 'Sports', to: '/browse?category=sports' },
];

export function ShopNavbar() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg">
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center gap-4 px-6 lg:gap-8 lg:px-10">
        <Link to="/browse" className="wordmark shrink-0">SHOP</Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {CATEGORIES.map((item) => {
            const active = item.featured && location.pathname.startsWith('/browse');
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`nav-link flex items-center gap-2 whitespace-nowrap ${active ? 'nav-link-active' : ''}`}
              >
                {item.featured && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="relative mx-auto hidden min-w-0 max-w-2xl flex-1 lg:block">
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            className="input-pill"
            placeholder="Search for products, brands, inspiration..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate(`/browse?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
              }
            }}
          />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <Link
            to={user ? '/wishlist' : '/login'}
            className="rounded-full p-2.5 text-text transition hover:bg-white/5"
            aria-label="Wishlist"
          >
            <IconHeart className="h-5 w-5" />
          </Link>
          <Link
            to={user ? '/cart' : '/login'}
            className="relative rounded-full p-2.5 text-text transition hover:bg-white/5"
            aria-label="Cart"
          >
            <IconBag className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">
                {itemCount > 99 ? '99+' : itemCount}
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
    <p className="eyebrow mt-6">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`}>
          {item.to ? (
            <Link to={item.to} className="hover:text-text">
              {item.label}
            </Link>
          ) : (
            item.label
          )}
          {i < items.length - 1 ? ' / ' : ''}
        </span>
      ))}
    </p>
  );
}

export function PageContainer({ children, wide }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={`mx-auto px-6 pb-20 pt-0 lg:px-10 ${wide ? 'max-w-[1600px]' : 'max-w-[1400px]'}`}>
      {children}
    </div>
  );
}
