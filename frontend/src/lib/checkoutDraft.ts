const KEY = 'checkout_draft';

export type CheckoutDraft = {
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    line1: string;
    line2: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  deliveryOption: 'standard' | 'express';
  cartId?: string;
  couponCode?: string;
};

export function loadCheckoutDraft(): CheckoutDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCheckoutDraft(draft: CheckoutDraft) {
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

export function clearCheckoutDraft() {
  sessionStorage.removeItem(KEY);
}
