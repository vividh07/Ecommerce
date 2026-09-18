import { Outlet } from 'react-router-dom';
import { ShopNavbar, PageContainer } from './ShopNavbar';

export function Shell() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ShopNavbar />
      <PageContainer wide>
        <Outlet />
      </PageContainer>
    </div>
  );
}
