import { useEffect, useMemo, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import type { SellerOutletContext } from '../../components/layout/SellerLayout';
import {
  SellerCard,
  SellerPageHeader,
  sellerBtnOutline,
  sellerBtnPrimary,
  sellerInputClass,
} from '../../components/seller/sellerUi';
import { IconExternal, IconPin } from '../../components/icons/Icons';
import { Skeleton } from '../../components/ui/Skeleton';

type SettingsForm = {
  storeName: string;
  storeSlug: string;
  supportEmail: string;
  supportPhone: string;
  description: string;
  logoUrl: string;
  coverUrl: string;
  category: string;
  pickupLine1: string;
  pickupCity: string;
  pickupState: string;
  pickupPostal: string;
  notifyOrders: boolean;
  notifyReturns: boolean;
  notifyPromo: boolean;
};

const empty: SettingsForm = {
  storeName: '',
  storeSlug: '',
  supportEmail: '',
  supportPhone: '',
  description: '',
  logoUrl: '',
  coverUrl: '',
  category: '',
  pickupLine1: '',
  pickupCity: '',
  pickupState: '',
  pickupPostal: '',
  notifyOrders: true,
  notifyReturns: true,
  notifyPromo: false,
};

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 rounded-full transition ${on ? 'bg-[#d4ff3f]' : 'bg-[#d4d4d4]'}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          on ? 'left-[22px]' : 'left-0.5'
        }`}
      />
    </button>
  );
}

export function SettingsPage() {
  const { sellerProfile, refreshSeller } = useOutletContext<SellerOutletContext>();
  const [form, setForm] = useState<SettingsForm>(empty);
  const [saved, setSaved] = useState<SettingsForm>(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('profile');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let profile = sellerProfile;
        try {
          const res = await api.get('/sellers/me');
          profile = res.data.data ?? profile;
        } catch {
          /* use outlet */
        }
        if (cancelled || !profile) {
          if (!cancelled) setLoading(false);
          return;
        }
        const next: SettingsForm = {
          storeName: profile.storeName ?? '',
          storeSlug: profile.storeSlug ?? '',
          supportEmail: profile.supportEmail ?? '',
          supportPhone: profile.supportPhone ?? '',
          description: profile.description ?? '',
          logoUrl: profile.logoUrl ?? '',
          coverUrl: profile.coverUrl ?? '',
          category: profile.category ?? '',
          pickupLine1: profile.pickupAddress?.line1 ?? '',
          pickupCity: profile.pickupAddress?.city ?? '',
          pickupState: profile.pickupAddress?.state ?? '',
          pickupPostal: profile.pickupAddress?.postalCode ?? '',
          notifyOrders: profile.notifications?.orderUpdates ?? true,
          notifyReturns: profile.notifications?.returns ?? true,
          notifyPromo: false,
        };
        setForm(next);
        setSaved(next);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sellerProfile]);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(saved), [form, saved]);

  async function save() {
    setSaving(true);
    try {
      const payload = {
        storeName: form.storeName.trim(),
        storeSlug: form.storeSlug,
        supportEmail: form.supportEmail,
        supportPhone: form.supportPhone,
        description: form.description,
        logoUrl: form.logoUrl,
        coverUrl: form.coverUrl,
        category: form.category,
        pickupAddress: {
          line1: form.pickupLine1,
          city: form.pickupCity,
          state: form.pickupState,
          postalCode: form.pickupPostal,
          country: 'India',
        },
        notifications: {
          orderUpdates: form.notifyOrders,
          returns: form.notifyReturns,
          lowStock: true,
          payouts: true,
        },
      };
      try {
        await api.patch('/sellers/me', payload);
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (status === 404 || status === 405) {
          toast.error('Settings API not available yet');
          return;
        }
        throw err;
      }
      setSaved(form);
      await refreshSeller();
      toast.success('Settings saved');
    } catch {
      toast.error('Could not save settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Skeleton className="h-96 w-full !bg-[#e5e5e5]" />;

  const tabs = [
    { id: 'profile', label: 'Store profile' },
    { id: 'pickup', label: 'Pickup address' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'team', label: 'Team' },
  ];

  return (
    <div className={dirty ? 'pb-28' : undefined}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <SellerPageHeader title="Store settings" subtitle="Manage how your store looks and operates." />
        <span className="rounded-full bg-[#d4ff3f] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#111]">
          Demo store
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-4 border-b border-[#e5e5e5]">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`border-b-2 pb-3 text-sm ${
              tab === t.id ? 'border-[#d4ff3f] font-medium text-[#111]' : 'border-transparent text-[#6b7280]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' || tab === 'pickup' ? (
        <div className="mt-6 grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-5">
            <SellerCard className="p-5">
              <h3 className="text-sm font-semibold">Branding</h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-[120px_1fr]">
                <div className="flex aspect-square flex-col items-center justify-center rounded-[10px] border border-dashed border-[#d4d4d4] bg-[#fafafa] p-3 text-center text-[11px] text-[#6b7280]">
                  Upload logo
                  <span className="mt-1 text-[#9ca3af]">JPG, PNG (max 2MB)</span>
                </div>
                <div className="relative min-h-[120px] overflow-hidden rounded-[10px] border border-[#e5e5e5] bg-[#f3f4f6]">
                  {form.coverUrl ? (
                    <img src={form.coverUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#9ca3af]">Store cover</div>
                  )}
                  <button type="button" className={sellerBtnOutline('absolute right-3 top-3 !py-1.5 !text-xs')}>
                    Change cover
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="text-sm font-medium">Store name</label>
                  <input
                    className={sellerInputClass('mt-1.5')}
                    value={form.storeName}
                    onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Store URL</label>
                  <div className="mt-1.5 flex overflow-hidden rounded-[8px] border border-[#e5e5e5]">
                    <span className="bg-[#f5f5f5] px-3 py-2.5 text-sm text-[#6b7280]">shop.example/</span>
                    <input
                      className="min-w-0 flex-1 border-0 px-3 py-2.5 text-sm outline-none"
                      value={form.storeSlug}
                      onChange={(e) =>
                        setForm({ ...form, storeSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Support email</label>
                    <input
                      className={sellerInputClass('mt-1.5')}
                      value={form.supportEmail}
                      onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Support phone</label>
                    <div className="mt-1.5 flex gap-2">
                      <span className="rounded-[8px] border border-[#e5e5e5] bg-[#f5f5f5] px-3 py-2.5 text-sm">+91</span>
                      <input
                        className={sellerInputClass()}
                        value={form.supportPhone}
                        onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Store description</label>
                  <textarea
                    className={sellerInputClass('mt-1.5 min-h-[110px]')}
                    maxLength={500}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                  <p className="mt-1 text-right text-xs text-[#9ca3af]">{form.description.length}/500</p>
                </div>
              </div>
            </SellerCard>

            <SellerCard className="p-5">
              <h3 className="text-sm font-semibold">Pickup address</h3>
              <div className="mt-4 flex items-start gap-3 rounded-[10px] border border-[#e5e5e5] p-4">
                <IconPin className="mt-0.5 h-4 w-4 shrink-0 text-[#6b7280]" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{form.storeName || 'Your store'}</p>
                  <p className="mt-1 text-sm text-[#6b7280]">
                    {form.pickupLine1 || 'Add a pickup address'}
                    {form.pickupCity ? `, ${form.pickupCity}` : ''}
                    {form.pickupState ? `, ${form.pickupState}` : ''}
                    {form.pickupPostal ? ` ${form.pickupPostal}` : ''}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <input
                      className={sellerInputClass()}
                      placeholder="Address line"
                      value={form.pickupLine1}
                      onChange={(e) => setForm({ ...form, pickupLine1: e.target.value })}
                    />
                    <input
                      className={sellerInputClass()}
                      placeholder="City"
                      value={form.pickupCity}
                      onChange={(e) => setForm({ ...form, pickupCity: e.target.value })}
                    />
                    <input
                      className={sellerInputClass()}
                      placeholder="State"
                      value={form.pickupState}
                      onChange={(e) => setForm({ ...form, pickupState: e.target.value })}
                    />
                    <input
                      className={sellerInputClass()}
                      placeholder="PIN"
                      value={form.pickupPostal}
                      onChange={(e) => setForm({ ...form, pickupPostal: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </SellerCard>
          </div>

          <div className="space-y-5">
            <SellerCard className="p-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">Customer-facing store preview</h3>
                <Link to="/browse" className="inline-flex items-center gap-1 text-xs text-[#2563eb]">
                  View live <IconExternal className="h-3 w-3" />
                </Link>
              </div>
              <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e5e5e5] bg-[#fafafa] p-4">
                <p className="text-lg font-semibold">{form.storeName || 'Your store'}</p>
                <p className="mt-1 text-[10px] uppercase tracking-widest text-[#9ca3af]">
                  Tools for a brighter tomorrow
                </p>
                <p className="mt-3 line-clamp-3 text-xs text-[#6b7280]">
                  {form.description || 'Your store description will appear here.'}
                </p>
              </div>
            </SellerCard>

            <SellerCard className="p-5">
              <h3 className="text-sm font-semibold">Notifications</h3>
              <ul className="mt-4 space-y-4">
                <li className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">New orders</p>
                    <p className="text-xs text-[#6b7280]">Get notified when customers place orders</p>
                  </div>
                  <Toggle on={form.notifyOrders} onChange={(v) => setForm({ ...form, notifyOrders: v })} />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Return requests</p>
                    <p className="text-xs text-[#6b7280]">Alerts for new return tickets</p>
                  </div>
                  <Toggle on={form.notifyReturns} onChange={(v) => setForm({ ...form, notifyReturns: v })} />
                </li>
                <li className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">Promotional updates</p>
                    <p className="text-xs text-[#6b7280]">Platform tips and campaigns</p>
                  </div>
                  <Toggle on={form.notifyPromo} onChange={(v) => setForm({ ...form, notifyPromo: v })} />
                </li>
              </ul>
            </SellerCard>
          </div>
        </div>
      ) : (
        <SellerCard className="mt-6 p-8 text-center text-sm text-[#6b7280]">
          {tab === 'shipping' && 'Shipping rules will appear here.'}
          {tab === 'notifications' && 'Use the Store profile tab for notification toggles.'}
          {tab === 'team' && 'Invite teammates coming soon.'}
        </SellerCard>
      )}

      {dirty ? (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#e5e5e5] bg-white/95 px-4 py-3 backdrop-blur md:left-60">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#6b7280]">Unsaved changes</p>
            <div className="flex gap-2">
              <button type="button" className={sellerBtnOutline()} onClick={() => setForm(saved)}>
                Cancel
              </button>
              <button type="button" className={sellerBtnPrimary()} disabled={saving} onClick={save}>
                Save changes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
