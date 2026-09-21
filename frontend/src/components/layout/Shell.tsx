import { Outlet, useLocation } from 'react-router-dom';
import { ShopNavbar, PageContainer } from './ShopNavbar';
import { SiteFooter } from './SiteFooter';

const FULL_BLEED_EXACT = new Set(['/', '/about', '/404']);

const CONTAINED_PREFIXES = [
  '/browse',
  '/product',
  '/wishlist',
  '/shopping-room',
  '/room',
  '/dashboard',
  '/cart',
  '/checkout',
  '/orders',
  '/account',
  '/contact',
  '/help',
  '/shipping-returns',
  '/privacy',
  '/terms',
];

function isFullBleedPath(pathname: string) {
  if (FULL_BLEED_EXACT.has(pathname)) return true;
  const known = CONTAINED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  return !known;
}

export function Shell() {
  const { pathname } = useLocation();
  const isFullBleed = isFullBleedPath(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <ShopNavbar />
      <main className="flex-1">
        {isFullBleed ? (
          <Outlet />
        ) : (
          <PageContainer wide>
            <Outlet />
          </PageContainer>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
