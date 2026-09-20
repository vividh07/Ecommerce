import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  IconBag,
  IconChevronDown,
  IconClose,
  IconHeart,
  IconMenu,
  IconSearch,
  IconUser,
} from '../icons/Icons';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const PROMO_KEY = 'shop-promo-dismissed';

const SHOP_DROPDOWN = [
  { label: 'All products', to: '/browse' },
  { label: 'Tech', to: '/browse?category=tech' },
  { label: 'Home', to: '/browse?category=home' },
  { label: 'Fashion', to: '/browse?category=fashion' },
  { label: 'Beauty', to: '/browse?category=beauty' },
];

const MAIN_NAV = [
  { label: 'Shop', to: '/browse', dropdown: true },
  { label: 'Collections', to: '/browse' },
  { label: 'About', to: '/about' },
] as const;

export function ShopNavbar() {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [promoVisible, setPromoVisible] = useState(false);
  const shopRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPromoVisible(localStorage.getItem(PROMO_KEY) !== '1');
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!shopRef.current?.contains(e.target as Node)) setShopOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  function dismissPromo() {
    localStorage.setItem(PROMO_KEY, '1');
    setPromoVisible(false);
  }

  function submitSearch(value: string) {
    const q = value.trim();
    navigate(q ? `/browse?q=${encodeURIComponent(q)}` : '/browse');
    setMobileOpen(false);
  }

  function isNavActive(label: string) {
    if (label === 'About') return location.pathname.startsWith('/about');
    if (label === 'Shop' || label === 'Collections') {
      return location.pathname.startsWith('/browse') || location.pathname.startsWith('/product');
    }
    return false;
  }

  const accountTo = user ? '/account/settings' : '/login';

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-black/95 backdrop-blur-md">
      {promoVisible && (
        <div className="relative border-b border-border bg-black px-4 py-2 text-center sm:px-6">
          <p className="text-xs text-muted sm:text-sm">Thoughtful finds. Everyday favourites.</p>
          <button
            type="button"
            aria-label="Dismiss promo"
            onClick={dismissPromo}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted transition hover:text-text sm:right-6"
          >
            <IconClose className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:gap-8 lg:px-10">
        <button
          type="button"
          className="rounded-full p-2 text-text lg:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <IconClose className="h-5 w-5" /> : <IconMenu className="h-5 w-5" />}
        </button>

        <Link to="/" className="wordmark shrink-0" onClick={() => setMobileOpen(false)}>
          SHOP
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {MAIN_NAV.map((item) => {
            const active = isNavActive(item.label);
            if ('dropdown' in item && item.dropdown) {
              return (
                <div key={item.label} className="relative" ref={shopRef}>
                  <button
                    type="button"
                    className={`nav-link flex items-center gap-2 whitespace-nowrap ${active ? 'nav-link-active' : ''}`}
                    onClick={() => setShopOpen((v) => !v)}
                    aria-expanded={shopOpen}
                  >
                    {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                    Shop
                    <IconChevronDown className={`h-3.5 w-3.5 transition ${shopOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {shopOpen && (
                    <div className="absolute left-0 top-full z-50 mt-3 min-w-[180px] rounded-[12px] border border-border bg-[#111] py-2 shadow-xl">
                      {SHOP_DROPDOWN.map((link) => (
                        <Link
                          key={link.to + link.label}
                          to={link.to}
                          className="block px-4 py-2 text-sm text-muted transition hover:bg-white/5 hover:text-text"
                          onClick={() => setShopOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`nav-link flex items-center gap-2 whitespace-nowrap ${active ? 'nav-link-active' : ''}`}
              >
                {active && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="relative mx-auto hidden min-w-0 max-w-2xl flex-1 md:block">
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            className="input-pill"
            placeholder="Search for products, brands, inspiration..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitSearch((e.target as HTMLInputElement).value);
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
            to={accountTo}
            className="rounded-full p-2.5 text-text transition hover:bg-white/5"
            aria-label="Account"
          >
            <IconUser className="h-5 w-5" />
          </Link>
          <Link
            to={user ? '/cart' : '/login'}
            className="relative rounded-full p-2.5 text-text transition hover:bg-white/5"
            aria-label="Cart"
          >
            <IconBag className="h-5 w-5" />
            <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-fg">
              {itemCount > 99 ? '99+' : itemCount}
            </span>
          </Link>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-black px-4 pb-5 pt-3 lg:hidden sm:px-6">
          <div className="relative mb-4">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              className="input-pill"
              placeholder="Search for products, brands, inspiration..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submitSearch((e.target as HTMLInputElement).value);
              }}
            />
          </div>
          <nav className="flex flex-col gap-1">
            <p className="px-2 py-1 text-xs uppercase tracking-wider text-muted">Shop</p>
            {SHOP_DROPDOWN.map((link) => (
              <Link
                key={link.to + link.label}
                to={link.to}
                className="rounded-lg px-3 py-2.5 text-sm text-text hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/browse"
              className="rounded-lg px-3 py-2.5 text-sm text-text hover:bg-white/5"
              onClick={() => setMobileOpen(false)}
            >
              Collections
            </Link>
            <Link
              to="/about"
              className="rounded-lg px-3 py-2.5 text-sm text-text hover:bg-white/5"
              onClick={() => setMobileOpen(false)}
            >
              About
            </Link>
          </nav>
        </div>
      )}
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
    <div className={`mx-auto px-4 pb-20 pt-0 sm:px-6 lg:px-10 ${wide ? 'max-w-[1600px]' : 'max-w-[1400px]'}`}>
      {children}
    </div>
  );
}
