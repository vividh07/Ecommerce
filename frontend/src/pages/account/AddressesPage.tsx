import { AccountSidebar } from '../../components/layout/AccountSidebar';
import { Breadcrumbs } from '../../components/layout/ShopNavbar';

export function AddressesPage() {
  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <AccountSidebar />
      <div>
        <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'ADDRESSES' }]} />
        <h1 className="page-title mt-4">Your addresses.</h1>
        <p className="mt-2 text-muted">Saved delivery locations for faster checkout.</p>
        <div className="card mt-8 p-6">
          <p className="font-medium">Home</p>
          <p className="mt-2 text-sm text-muted">Add an address during checkout to save it here.</p>
          <button type="button" className="btn-outline mt-6">Add address</button>
        </div>
      </div>
    </div>
  );
}
