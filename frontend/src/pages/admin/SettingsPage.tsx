import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { DemoBadge, PageHeader } from '../../components/admin/adminUi';
import { IconExternal, IconWarning } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';

type Settings = {
  storeName: string;
  supportEmail: string;
  currency: string;
  timezone: string;
  storeUrl: string;
  businessName: string;
  address: string;
  country: string;
  testMode: boolean;
};

const empty: Settings = {
  storeName: '',
  supportEmail: '',
  currency: 'INR',
  timezone: 'Asia/Kolkata',
  storeUrl: '',
  businessName: '',
  address: '',
  country: 'IN',
  testMode: true,
};

export function SettingsPage() {
  const [form, setForm] = useState<Settings>(empty);
  const [saved, setSaved] = useState<Settings>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('general');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/admin/settings');
        const data = { ...empty, ...(res.data.data ?? {}) };
        setForm(data);
        setSaved(data);
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  async function save() {
    setSaving(true);
    try {
      const res = await api.patch('/admin/settings', form);
      const data = { ...empty, ...(res.data.data ?? form) };
      setForm(data);
      setSaved(data);
      toast.success('Settings saved');
    } catch {
      toast.error('Could not save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className={dirty ? 'pb-28' : undefined}>
      <PageHeader
        title="Store settings"
        subtitle="Manage your store details, preferences and configurations."
      />

      <div className="mt-6 flex flex-wrap gap-4 border-b border-border">
        {['General', 'Payments', 'Shipping', 'Notifications', 'Team'].map((t) => {
          const id = t.toLowerCase();
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`border-b-2 pb-3 text-sm ${
                tab === id ? 'border-[#d4ff3f] text-white' : 'border-transparent text-muted'
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      {tab !== 'general' ? (
        <div className="panel mt-8 p-8 text-sm text-muted">
          <DemoBadge className="mb-3" />
          {tab.charAt(0).toUpperCase() + tab.slice(1)} settings will be available in a later release.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="panel space-y-4 p-5">
              <h2 className="font-semibold">Store details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-1">
                  <span className="mb-1.5 block text-muted">Store name</span>
                  <input
                    className="input-field"
                    value={form.storeName}
                    onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))}
                  />
                  <span className="mt-1 block text-xs text-muted">This name will be visible to your customers</span>
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-muted">Support email</span>
                  <input
                    className="input-field"
                    type="email"
                    value={form.supportEmail}
                    onChange={(e) => setForm((f) => ({ ...f, supportEmail: e.target.value }))}
                  />
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-muted">Currency</span>
                  <select
                    className="input-field"
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  >
                    <option value="INR">INR (Indian Rupee)</option>
                    <option value="USD">USD</option>
                  </select>
                </label>
                <label className="block text-sm">
                  <span className="mb-1.5 block text-muted">Time zone</span>
                  <select
                    className="input-field"
                    value={form.timezone}
                    onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="UTC">UTC</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="panel space-y-4 p-5">
              <h2 className="font-semibold">Store branding</h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-[10px] border border-border bg-black font-display text-xl tracking-[0.2em]">
                  LUMEN
                </div>
                <button type="button" className="btn-outline text-sm">
                  Upload logo
                </button>
              </div>
              <p className="text-xs text-muted">A square logo works best. Recommended size 512 x 512px.</p>
              <div className="rounded-[10px] border border-border bg-panel-2 px-6 py-8 text-center font-display text-3xl tracking-[0.35em]">
                LUMEN
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="panel p-5">
              <h2 className="font-semibold">Store status</h2>
              <p className="mt-1 text-sm text-muted">Your store is active and ready.</p>
              <div className="mt-4 rounded-[10px] border border-border bg-panel-2 p-4">
                <p className="font-medium">{form.storeName || 'Demo store'}</p>
                <p className="text-xs text-muted">{form.storeUrl || 'demo.shop.com'}</p>
                <label className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#d4ff3f]/40 bg-[#d4ff3f]/10 px-3 py-1 text-xs text-[#d4ff3f]">
                  <input
                    type="checkbox"
                    className="accent-[#d4ff3f]"
                    checked={form.testMode}
                    onChange={(e) => setForm((f) => ({ ...f, testMode: e.target.checked }))}
                  />
                  Test mode
                </label>
              </div>
              <Link to="/browse" className="mt-4 inline-flex items-center gap-2 text-sm text-[#d4ff3f]">
                View storefront
                <IconExternal className="h-3.5 w-3.5" />
              </Link>
            </section>

            <section className="panel space-y-4 p-5">
              <h2 className="font-semibold">Business contact</h2>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Business name</span>
                <input
                  className="input-field"
                  value={form.businessName}
                  onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Address</span>
                <textarea
                  className="input-field min-h-24"
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </label>
              <label className="block text-sm">
                <span className="mb-1.5 block text-muted">Country</span>
                <select
                  className="input-field"
                  value={form.country}
                  onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
                >
                  <option value="IN">India</option>
                  <option value="US">United States</option>
                </select>
              </label>
            </section>
          </div>
        </div>
      )}

      {dirty ? (
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-[#111]/95 backdrop-blur md:left-60">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-8">
            <p className="flex items-center gap-2 text-sm text-warning">
              <IconWarning className="h-4 w-4" />
              You have unsaved changes. Make sure to save your changes before leaving this page.
            </p>
            <div className="flex gap-2">
              <button type="button" className="btn-outline text-sm" onClick={() => setForm(saved)}>
                Discard
              </button>
              <button type="button" className="btn-primary text-sm" disabled={saving} onClick={save}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
