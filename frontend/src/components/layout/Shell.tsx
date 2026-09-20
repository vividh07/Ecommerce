import { Outlet, useLocation } from 'react-router-dom';
import { ShopNavbar, PageContainer } from './ShopNavbar';

export function Shell() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ShopNavbar />
      {isHome ? (
        <Outlet />
      ) : (
        <PageContainer wide>
          <Outlet />
        </PageContainer>
      )}
    </div>
  );
}
