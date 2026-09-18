import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { useCart } from '../../context/CartContext';
import { Breadcrumbs } from '../../components/layout/ShopNavbar';
import { Stepper } from '../../components/ui/Stepper';
import { loadCheckoutDraft, clearCheckoutDraft, saveCheckoutDraft } from '../../lib/checkoutDraft';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
const steps = [
  { id: 'cart', label: 'Cart' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

function PayForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    const { error, paymentIntent } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
    if (error) {
      toast.error(error.message ?? 'Payment failed');
      setBusy(false);
      return;
    }
    if (paymentIntent?.status === 'succeeded') {
      clearCheckoutDraft();
      navigate(`/orders/confirmation/${orderId}`);
    }
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4 border-t border-border pt-6">
      <PaymentElement />
      <button type="submit" className="btn-primary w-full" disabled={!stripe || busy}>
        Pay securely →
      </button>
      <p className="text-center text-xs text-muted">🔒 Payments are processed securely.</p>
    </form>
  );
}

export function CheckoutPaymentPage() {
  const [params] = useSearchParams();
  const { cart, activeCartId, refresh } = useCart();
  const cartId = params.get('cartId') ?? activeCartId;
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [payMethod, setPayMethod] = useState<'card' | 'upi' | 'wallet'>('card');

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const draft = loadCheckoutDraft();
    if (!draft || !cart?.items.length) return;
    (async () => {
      try {
        const res = await api.post('/checkout/payment-intent', {
          shippingAddress: {
            fullName: draft.shippingAddress.fullName,
            line1: draft.shippingAddress.line1,
            line2: draft.shippingAddress.line2,
            city: draft.shippingAddress.city,
            state: draft.shippingAddress.state,
            postalCode: draft.shippingAddress.postalCode,
            country: draft.shippingAddress.country,
            phone: draft.shippingAddress.phone,
          },
          cartId,
          couponCode: draft.couponCode || couponCode || undefined,
        });
        setClientSecret(res.data.data.clientSecret);
        setOrderId(res.data.data.orderId);
        setDiscount(res.data.data.discountAmount ?? 0);
      } catch (err: any) {
        toast.error(err.response?.data?.message ?? 'Checkout failed');
      }
    })();
  }, [cart, cartId]);

  const total = Math.max(0, (cart?.subtotal ?? 0) - discount);

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'CHECKOUT' }]} />
      <h1 className="page-title mt-4">The final step.</h1>
      <div className="mt-8 max-w-3xl">
        <Stepper steps={steps} current={2} />
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="panel p-6">
          <h2 className="font-semibold">Select payment method</h2>
          <p className="mt-1 text-sm text-muted">Choose how you&apos;d like to pay.</p>
          <ul className="mt-6 space-y-3">
            {[
              { id: 'upi' as const, title: 'UPI', sub: 'Google Pay, PhonePe, Paytm' },
              { id: 'card' as const, title: 'Credit / debit card', sub: 'Visa, Mastercard, Amex' },
              { id: 'wallet' as const, title: 'Wallet', sub: 'Store credit & gift cards' },
            ].map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setPayMethod(m.id)}
                  className={`payment-option w-full text-left ${payMethod === m.id ? 'payment-option-selected' : ''}`}
                >
                  <div>
                    <p className="font-medium">{m.title}</p>
                    <p className="text-xs text-muted">{m.sub}</p>
                  </div>
                  <span
                    className={`h-4 w-4 rounded-full border-2 ${
                      payMethod === m.id ? 'border-accent bg-accent' : 'border-border'
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
          {clientSecret && orderId ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PayForm orderId={orderId} />
            </Elements>
          ) : (
            <p className="mt-6 text-sm text-muted">Preparing secure checkout…</p>
          )}
        </div>

        <div className="panel h-fit p-6">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Order summary</span>
            <span className="text-muted">{cart?.items.length} items</span>
          </div>
          <ul className="mt-4 space-y-4 border-b border-border pb-4">
            {cart?.items.map((i) => (
              <li key={i.variantId} className="flex gap-3 text-sm">
                {i.product.image && (
                  <img src={i.product.image} alt="" className="h-14 w-14 rounded-[8px] border border-border object-cover" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{i.product.name}</p>
                  <p className="text-muted">Qty {i.quantity}</p>
                </div>
                <p className="shrink-0 font-medium">${i.lineTotal.toFixed(2)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>${cart?.subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-accent">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-3 text-lg font-semibold">
              <span>Order total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <input
              className="input-field flex-1"
              placeholder="Promo code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            <button
              type="button"
              className="btn-outline shrink-0"
              onClick={() => {
                const d = loadCheckoutDraft();
                if (d) saveCheckoutDraft({ ...d, couponCode });
                window.location.reload();
              }}
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
