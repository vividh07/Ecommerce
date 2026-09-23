import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { AccountSidebar } from '../../components/layout/AccountSidebar';
import { Breadcrumbs } from '../../components/layout/ShopNavbar';
import { api } from '../../lib/api';
import { Skeleton } from '../../components/ui/Skeleton';

type Address = {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

const EMPTY = {
  label: 'Home',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'IN',
  isDefault: true,
};

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Delhi',
  'Gujarat',
  'Karnataka',
  'Kerala',
  'Maharashtra',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'West Bengal',
];

export function AddressesPage() {
  const [items, setItems] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/account/addresses');
      setItems(res.data.items ?? []);
    } catch {
      toast.error('Failed to load addresses');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function startAdd() {
    setEditingId(null);
    setForm({ ...EMPTY, isDefault: items.length === 0 });
    setOpen(true);
  }

  function startEdit(a: Address) {
    setEditingId(a._id);
    setForm({
      label: a.label || 'Home',
      fullName: a.fullName,
      phone: a.phone,
      line1: a.line1,
      line2: a.line2 || '',
      city: a.city,
      state: a.state,
      postalCode: a.postalCode,
      country: a.country || 'IN',
      isDefault: Boolean(a.isDefault),
    });
    setOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/account/addresses/${editingId}`, form);
        toast.success('Address updated');
      } else {
        await api.post('/account/addresses', form);
        toast.success('Address saved');
      }
      setOpen(false);
      await load();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Could not save address';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    try {
      await api.delete(`/account/addresses/${id}`);
      toast.success('Address removed');
      await load();
    } catch {
      toast.error('Could not remove address');
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <AccountSidebar />
      <div>
        <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'ADDRESSES' }]} />
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="page-title">Your addresses.</h1>
            <p className="mt-2 text-muted">Saved delivery locations for faster checkout.</p>
          </div>
          <button type="button" className="btn-primary" onClick={startAdd}>
            Add address
          </button>
        </div>

        {loading ? (
          <Skeleton className="mt-8 h-40 w-full" />
        ) : items.length === 0 ? (
          <div className="card mt-8 p-6">
            <p className="font-medium">No saved addresses</p>
            <p className="mt-2 text-sm text-muted">Add a delivery address to use at checkout.</p>
            <button type="button" className="btn-outline mt-6" onClick={startAdd}>
              Add address
            </button>
          </div>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {items.map((a) => (
              <li key={a._id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {a.label}
                      {a.isDefault ? (
                        <span className="ml-2 text-xs font-normal text-accent">Default</span>
                      ) : null}
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      {a.fullName}
                      <br />
                      {a.line1}
                      {a.line2 ? (
                        <>
                          <br />
                          {a.line2}
                        </>
                      ) : null}
                      <br />
                      {a.city}, {a.state} {a.postalCode}
                      <br />
                      {a.phone}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button type="button" className="btn-outline text-sm" onClick={() => startEdit(a)}>
                    Edit
                  </button>
                  <button type="button" className="btn-outline text-sm" onClick={() => void remove(a._id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {open ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <form
              onSubmit={(e) => void save(e)}
              className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[12px] border border-border bg-bg p-6 shadow-xl"
            >
              <h2 className="text-lg font-semibold">{editingId ? 'Edit address' : 'Add address'}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs text-muted">Label</label>
                  <input
                    className="input-field"
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs text-muted">Full name</label>
                  <input
                    className="input-field"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs text-muted">Phone</label>
                  <input
                    className="input-field"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    inputMode="tel"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs text-muted">Address line 1</label>
                  <input
                    className="input-field"
                    value={form.line1}
                    onChange={(e) => setForm({ ...form, line1: e.target.value })}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs text-muted">Address line 2</label>
                  <input
                    className="input-field"
                    value={form.line2}
                    onChange={(e) => setForm({ ...form, line2: e.target.value })}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted">City</label>
                  <input
                    className="input-field"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted">State</label>
                  <select
                    className="input-field"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    required
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-muted">Postal code</label>
                  <input
                    className="input-field"
                    value={form.postalCode}
                    onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isDefault}
                      onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                    />
                    Default address
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button type="button" className="btn-outline" onClick={() => setOpen(false)} disabled={saving}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : 'Save address'}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
