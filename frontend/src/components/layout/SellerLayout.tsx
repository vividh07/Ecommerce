import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import type { SellerProfile } from '../../types';
import { SellerSidebar } from './SellerSidebar';
import { SellerTopBar } from './SellerTopBar';

export type SellerOutletContext = {
  sellerProfile: SellerProfile | null;
  refreshSeller: () => Promise<void>;
};

export function SellerLayout() {
  const { user, seller, loading, refreshProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  async function refreshSeller() {
    try {
      const res = await api.get('/sellers/me');
      const data = res.data.data as SellerProfile;
      setSellerProfile({
        ...data,
        id: data.id ?? (data as { _id?: string })._id ?? seller?.id ?? '',
        storeName: data.storeName ?? seller?.storeName ?? '',
        isApproved: Boolean(data.isApproved ?? seller?.isApproved),
      });
    } catch {
      setSellerProfile(
        seller
          ? {
              id: seller.id,
              storeName: seller.storeName,
              isApproved: seller.isApproved,
              onboardingComplete: false,
            }
          : null
      );
    }
  }

  useEffect(() => {
    if (loading || !user) return;
    let cancelled = false;
    (async () => {
      setProfileLoading(true);
      await refreshProfile();
      if (cancelled) return;
      try {
        const res = await api.get('/sellers/me');
        if (!cancelled) {
          const data = res.data.data as SellerProfile;
          setSellerProfile({
            ...data,
            id: data.id ?? (data as { _id?: string })._id ?? '',
            storeName: data.storeName ?? '',
            isApproved: Boolean(data.isApproved),
          });
        }
      } catch {
        if (!cancelled) {
          setSellerProfile(
            seller
              ? {
                  id: seller.id,
                  storeName: seller.storeName,
                  isApproved: seller.isApproved,
                  onboardingComplete: false,
                }
              : null
          );
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user?.id]);

  useEffect(() => {
    if (profileLoading || loading) return;
    const onOnboarding = location.pathname.startsWith('/seller/onboarding');
    if (!sellerProfile && !onOnboarding) {
      navigate('/seller/onboarding', { replace: true });
    }
  }, [profileLoading, loading, sellerProfile, location.pathname, navigate]);

  if (loading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] text-[#6b7280]">Loading…</div>
    );
  }

  if (!user || (user.role !== 'SELLER' && user.role !== 'ADMIN')) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] px-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-[#111]">Access denied</h1>
          <p className="mt-2 text-sm text-[#6b7280]">Seller access only.</p>
        </div>
      </div>
    );
  }

  const approved = Boolean(sellerProfile?.isApproved ?? seller?.isApproved);
  const storeName = sellerProfile?.storeName || seller?.storeName;

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5] text-[#111] md:flex-row">
      <SellerSidebar storeName={storeName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <SellerTopBar />
        {!approved && sellerProfile ? (
          <div className="border-b border-[#fde68a] bg-[#fffbeb] px-4 py-2.5 text-sm text-[#92400e] md:px-6">
            Your store <strong>{storeName}</strong> is pending approval. You can still explore Seller Center.
          </div>
        ) : null}
        <main className="min-w-0 flex-1 p-4 md:p-8">
          <Outlet context={{ sellerProfile, refreshSeller } satisfies SellerOutletContext} />
        </main>
      </div>
    </div>
  );
}
