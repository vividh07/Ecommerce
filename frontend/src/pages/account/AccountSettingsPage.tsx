import { useState } from 'react';
import toast from 'react-hot-toast';
import { AccountSidebar } from '../../components/layout/AccountSidebar';
import { Breadcrumbs } from '../../components/layout/ShopNavbar';
import { IconChevronRight } from '../../components/icons/Icons';
import { useAuth } from '../../context/AuthContext';

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 shrink-0 rounded-full p-0.5 transition ${
        on ? 'bg-[#d4ff3f]' : 'bg-white/15'
      }`}
    >
      <span
        className={`block h-6 w-6 rounded-full bg-bg shadow transition ${on ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

export function AccountSettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState('');
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [marketing, setMarketing] = useState(false);

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-14">
      <AccountSidebar />
      <div className="min-w-0 flex-1">
        <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'ACCOUNT' }]} />
        <h1 className="page-title mt-4">Your space.</h1>
        <p className="mt-3 text-sm text-muted">Manage your account and preferences.</p>

        <div className="panel mt-10 divide-y divide-border">
          <section className="p-6 md:p-8">
            <h2 className="text-base font-semibold">Profile details</h2>
            <p className="mt-1 text-sm text-muted">Keep your information up to date.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm text-muted">Full name</label>
                <input
                  className="input-field"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm text-muted">Email address</label>
                <input
                  className="input-field"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm text-muted">Phone number (optional)</label>
                <div className="flex gap-2">
                  <select className="input-field w-[5.5rem] shrink-0" defaultValue="+91" aria-label="Country code">
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <input
                    className="input-field flex-1"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    placeholder="98765 43210"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                className="btn-primary"
                onClick={() => toast.success('Profile saved')}
              >
                Save changes
              </button>
            </div>
          </section>

          <section className="p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold">Password and security</h2>
                <p className="mt-1 text-sm text-muted">Keep your account secure.</p>
              </div>
              <button type="button" className="btn-outline">
                Change password
                <IconChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section className="p-6 md:p-8">
            <h2 className="text-base font-semibold">Notification preferences</h2>
            <p className="mt-1 text-sm text-muted">Choose what you&apos;d like to hear about.</p>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Order updates</p>
                  <p className="mt-0.5 text-xs text-muted">Shipping and delivery notifications.</p>
                </div>
                <Toggle on={orderUpdates} onChange={setOrderUpdates} label="Order updates" />
              </div>
              <div className="flex items-center justify-between gap-4 border-t border-border pt-5">
                <div>
                  <p className="text-sm font-medium">Marketing and offers</p>
                  <p className="mt-0.5 text-xs text-muted">Promotions, launches and tips.</p>
                </div>
                <Toggle on={marketing} onChange={setMarketing} label="Marketing and offers" />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
