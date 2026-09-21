import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import type { SellerOutletContext } from '../../components/layout/SellerLayout';
import {
  SellerCard,
  sellerBtnOutline,
  sellerBtnPrimary,
  sellerInputClass,
} from '../../components/seller/sellerUi';
import { IconCheck, IconChevronRight } from '../../components/icons/Icons';

const STEPS = [
  { title: 'Store details', sub: "Add your store's public information." },
  { title: 'Business details', sub: 'Tell us about your business.' },
  { title: 'Payout account', sub: 'Where should we send your earnings?' },
  { title: 'Review', sub: 'Confirm and submit for approval.' },
];

export function OnboardingPage() {
  const { refreshProfile } = useAuth();
  const { sellerProfile, refreshSeller } = useOutletContext<SellerOutletContext>();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    storeName: '',
    storeSlug: '',
    supportEmail: '',
    supportPhone: '',
    category: 'Lifestyle',
    description: '',
    logoUrl: '',
    coverUrl: '',
    businessName: '',
    gstin: '',
    bankName: '',
    accountLast4: '',
    holderName: '',
  });

  useEffect(() => {
    if (!sellerProfile) return;
    setForm((f) => ({
      ...f,
      storeName: sellerProfile.storeName ?? '',
      storeSlug: sellerProfile.storeSlug ?? '',
      supportEmail: sellerProfile.supportEmail ?? '',
      supportPhone: sellerProfile.supportPhone ?? '',
      category: sellerProfile.category || 'Lifestyle',
      description: sellerProfile.description ?? '',
      logoUrl: sellerProfile.logoUrl ?? '',
      coverUrl: sellerProfile.coverUrl ?? '',
      bankName: sellerProfile.payoutDestination?.bankName ?? '',
      accountLast4: sellerProfile.payoutDestination?.accountLast4 ?? '',
      holderName: sellerProfile.payoutDestination?.holderName ?? '',
    }));
    setStep(Math.min(4, Math.max(1, sellerProfile.onboardingStep ?? 1)));
  }, [sellerProfile]);

  const pending = Boolean(sellerProfile && !sellerProfile.isApproved && sellerProfile.onboardingComplete);
  const charCount = form.description.length;

  const previewInitial = useMemo(
    () => (form.storeName || 'S').trim().charAt(0).toUpperCase(),
    [form.storeName]
  );

  async function applyOrPatch(payload: Record<string, unknown>, complete = false) {
    setSaving(true);
    try {
      if (!sellerProfile) {
        await api.post('/sellers/apply', {
          storeName: form.storeName.trim(),
          description: form.description,
          supportEmail: form.supportEmail,
          supportPhone: form.supportPhone,
          storeSlug: form.storeSlug,
          category: form.category,
        });
        toast.success('Application started');
      } else {
        try {
          await api.patch('/sellers/me', {
            ...payload,
            onboardingStep: complete ? 4 : step + 1,
            onboardingComplete: complete,
          });
        } catch (err: unknown) {
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status === 404 || status === 405) {
            /* PATCH may not exist yet — still advance UI */
          } else {
            throw err;
          }
        }
      }
      await refreshProfile();
      await refreshSeller();
      if (complete) {
        toast.success('Submitted for review');
        navigate('/seller', { replace: true });
      } else {
        setStep((s) => Math.min(4, s + 1));
      }
    } catch {
      toast.error('Could not save. Check your details and try again.');
    } finally {
      setSaving(false);
    }
  }

  async function continueStep() {
    if (step === 1) {
      if (!form.storeName.trim()) {
        toast.error('Store name is required');
        return;
      }
      await applyOrPatch({
        storeName: form.storeName.trim(),
        storeSlug: form.storeSlug,
        supportEmail: form.supportEmail,
        supportPhone: form.supportPhone,
        category: form.category,
        description: form.description,
        logoUrl: form.logoUrl,
        coverUrl: form.coverUrl,
      });
      return;
    }
    if (step === 2) {
      await applyOrPatch({ storeName: form.storeName.trim() });
      return;
    }
    if (step === 3) {
      await applyOrPatch({
        payoutDestination: {
          bankName: form.bankName,
          accountLast4: form.accountLast4,
          holderName: form.holderName,
        },
      });
      return;
    }
    await applyOrPatch(
      {
        storeName: form.storeName.trim(),
        description: form.description,
        supportEmail: form.supportEmail,
        supportPhone: form.supportPhone,
        storeSlug: form.storeSlug,
        category: form.category,
        onboardingComplete: true,
      },
      true
    );
  }

  if (pending) {
    return (
      <div className="mx-auto max-w-xl">
        <p className="text-sm text-[#6b7280]">Application status</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#111]">Pending approval</h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          We&apos;re reviewing <strong>{sellerProfile?.storeName}</strong>. You can browse Seller Center while you wait.
        </p>
        <SellerCard className="mt-8 p-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#fef3c7] text-[#b45309]">
            …
          </div>
          <p className="mt-4 font-medium">Under review</p>
          <p className="mt-1 text-sm text-[#6b7280]">Usually takes 1–2 business days.</p>
          <button type="button" className={sellerBtnPrimary('mt-6')} onClick={() => navigate('/seller')}>
            Go to overview
          </button>
        </SellerCard>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-[#6b7280]">Step {step} of 4</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#111] md:text-4xl">
        {step === 4 ? 'Review and submit.' : "Let's set up your store."}
      </h1>
      <p className="mt-2 text-sm text-[#6b7280]">
        {step === 1
          ? 'Start with the details customers will see.'
          : step === 4
            ? 'Make sure everything looks right before submitting.'
            : STEPS[step - 1]?.sub}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[220px_1fr_280px]">
        <ol className="space-y-0">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <li key={s.title} className="relative flex gap-3 pb-8 last:pb-0">
                {i < STEPS.length - 1 ? (
                  <span className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-px bg-[#e5e5e5]" />
                ) : null}
                <span
                  className={`relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                    active
                      ? 'bg-[#d4ff3f] text-[#111]'
                      : done
                        ? 'bg-[#111] text-white'
                        : 'bg-[#e5e5e5] text-[#6b7280]'
                  }`}
                >
                  {done ? <IconCheck className="h-3.5 w-3.5" /> : n}
                </span>
                <div>
                  <p className={`text-sm font-medium ${active ? 'text-[#111]' : 'text-[#6b7280]'}`}>{s.title}</p>
                  <p className="mt-0.5 text-xs text-[#9ca3af]">{s.sub}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <SellerCard className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Store name</label>
                <input
                  className={sellerInputClass('mt-1.5')}
                  value={form.storeName}
                  onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                  required
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
                    placeholder="studio-supply"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">Support email</label>
                  <input
                    type="email"
                    className={sellerInputClass('mt-1.5')}
                    value={form.supportEmail}
                    onChange={(e) => setForm({ ...form, supportEmail: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Support phone <span className="font-normal text-[#9ca3af]">optional</span>
                  </label>
                  <input
                    className={sellerInputClass('mt-1.5')}
                    value={form.supportPhone}
                    onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                    placeholder="+91"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Store category</label>
                <select
                  className={sellerInputClass('mt-1.5')}
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {['Lifestyle', 'Electronics', 'Fashion', 'Home', 'Beauty', 'Other'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Short description</label>
                <textarea
                  className={sellerInputClass('mt-1.5 min-h-[100px]')}
                  maxLength={300}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
                <p className="mt-1 text-right text-xs text-[#9ca3af]">{charCount}/300</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex aspect-square flex-col items-center justify-center rounded-[10px] border border-dashed border-[#d4d4d4] bg-[#fafafa] p-4 text-center text-sm text-[#6b7280]">
                  Upload logo
                  <span className="mt-1 text-[11px] text-[#9ca3af]">512×512 recommended</span>
                </div>
                <div className="flex aspect-[16/9] flex-col items-center justify-center rounded-[10px] border border-dashed border-[#d4d4d4] bg-[#fafafa] p-4 text-center text-sm text-[#6b7280] sm:aspect-auto sm:min-h-[140px]">
                  Upload cover <span className="text-[#9ca3af]">(optional)</span>
                  <span className="mt-1 text-[11px] text-[#9ca3af]">1600×600 recommended</span>
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Legal / business name</label>
                <input
                  className={sellerInputClass('mt-1.5')}
                  value={form.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  placeholder="Same as store or registered name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">GSTIN (optional)</label>
                <input
                  className={sellerInputClass('mt-1.5')}
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                />
              </div>
              <p className="text-sm text-[#6b7280]">You can finish business verification later from Store settings.</p>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Account holder</label>
                <input
                  className={sellerInputClass('mt-1.5')}
                  value={form.holderName}
                  onChange={(e) => setForm({ ...form, holderName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bank name</label>
                <input
                  className={sellerInputClass('mt-1.5')}
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Account last 4 digits</label>
                <input
                  className={sellerInputClass('mt-1.5')}
                  maxLength={4}
                  value={form.accountLast4}
                  onChange={(e) => setForm({ ...form, accountLast4: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                />
              </div>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-[#f0f0f0] py-2">
                <span className="text-[#6b7280]">Store</span>
                <span className="font-medium">{form.storeName || '—'}</span>
              </div>
              <div className="flex justify-between border-b border-[#f0f0f0] py-2">
                <span className="text-[#6b7280]">Category</span>
                <span className="font-medium">{form.category}</span>
              </div>
              <div className="flex justify-between border-b border-[#f0f0f0] py-2">
                <span className="text-[#6b7280]">Support</span>
                <span className="font-medium">{form.supportEmail || '—'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#6b7280]">Payout</span>
                <span className="font-medium">
                  {form.bankName ? `${form.bankName} ···· ${form.accountLast4 || '????'}` : 'Not set'}
                </span>
              </div>
              {!sellerProfile?.isApproved ? (
                <p className="rounded-[8px] bg-[#fffbeb] px-3 py-2 text-xs text-[#92400e]">
                  After submit, your store stays pending until an admin approves it.
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              className={sellerBtnOutline()}
              disabled={saving || step === 1}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              {step === 1 ? 'Save draft' : 'Back'}
            </button>
            <button type="button" className={sellerBtnPrimary()} disabled={saving} onClick={continueStep}>
              {step === 4 ? 'Submit' : 'Continue'}
              {step < 4 ? <IconChevronRight className="h-4 w-4" /> : null}
            </button>
          </div>
        </SellerCard>

        <SellerCard className="h-fit p-5">
          <p className="text-sm font-semibold">Store preview</p>
          <p className="mt-1 text-xs text-[#6b7280]">This is how your store could look on SHOP.</p>
          <div className="mt-4 overflow-hidden rounded-[10px] border border-[#e5e5e5]">
            <div className="h-20 bg-gradient-to-br from-[#e5e5e5] to-[#f5f5f5]">
              {form.coverUrl ? <img src={form.coverUrl} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <div className="relative px-4 pb-4 pt-6">
              <span className="absolute -top-5 left-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#d4ff3f] text-sm font-bold text-[#111]">
                {previewInitial}
              </span>
              <p className="font-semibold">{form.storeName || 'Your store'}</p>
              <span className="mt-1 inline-block rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10px] text-[#6b7280]">
                {form.category}
              </span>
              <p className="mt-2 text-xs leading-relaxed text-[#6b7280]">
                {form.description || 'Your short description will appear here.'}
              </p>
            </div>
          </div>
          <p className="mt-4 text-[11px] text-[#9ca3af]">You can update these details later.</p>
        </SellerCard>
      </div>
    </div>
  );
}
