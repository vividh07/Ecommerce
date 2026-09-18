import { useState } from 'react';
import toast from 'react-hot-toast';
import { AccountSidebar } from '../../components/layout/AccountSidebar';
import { Breadcrumbs } from '../../components/layout/ShopNavbar';
import { useAuth } from '../../context/AuthContext';

export function AccountSettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <AccountSidebar />
      <div>
        <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'ACCOUNT' }]} />
        <h1 className="page-title mt-4">Your space.</h1>
        <p className="mt-2 text-muted">Manage your account and preferences.</p>

        <div className="card mt-10 p-6 md:p-8">
          <section>
            <h2 className="font-semibold">Profile details</h2>
            <p className="text-sm text-muted">Keep your information up to date.</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm">Full name</label>
                <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm">Email</label>
                <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="mb-2 block text-sm">Phone</label>
                <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1" />
              </div>
            </div>
            <button type="button" className="btn-primary mt-6" onClick={() => toast.success('Profile saved')}>
              Save changes
            </button>
          </section>

          <section className="mt-10 border-t border-border pt-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-semibold">Password and security</h2>
                <p className="text-sm text-muted">Keep your account secure.</p>
              </div>
              <button type="button" className="btn-outline">Change password →</button>
            </div>
          </section>

          <section className="mt-10 border-t border-border pt-10">
            <h2 className="font-semibold">Notification preferences</h2>
            <p className="text-sm text-muted">Choose what you&apos;d like to hear about.</p>
            {['Order updates', 'Promotions', 'New arrivals'].map((label) => (
              <div key={label} className="mt-4 flex items-center justify-between border-b border-border py-3 last:border-0">
                <span className="text-sm">{label}</span>
                <div className="h-6 w-11 rounded-full bg-accent p-0.5">
                  <div className="ml-auto h-5 w-5 rounded-full bg-bg" />
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
