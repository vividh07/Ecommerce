import { Outlet } from 'react-router-dom';
import { ShopNavbar } from './ShopNavbar';

export function Shell() {
  return (
    <div className="min-h-screen bg-bg">
      <ShopNavbar />
      <main className="mx-auto max-w-[1400px] px-4 py-8 md:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export function ShellMinimal({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bg">{children}</div>;
}
