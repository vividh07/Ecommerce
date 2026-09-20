import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import { useCart } from '../../context/CartContext';
import { Breadcrumbs } from '../../components/layout/ShopNavbar';
import { Stepper } from '../../components/ui/Stepper';
import { IconCreditCard, IconLock } from '../../components/icons/Icons';
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
        Continue to payment provider →
      </button>
      <p className="flex items-center justify-center gap-2 text-center text-xs text-muted">
        <IconLock className="h-3.5 w-3.5" />
        Complete payment securely on the provider page.
      </p>
    </form>
  );
}

function UpiMarks() {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((name) => (
        <span
          key={name}
          className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted"
        >
          {name}
        </span>
      ))}
    </div>
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
  const [payMethod, setPayMethod] = useState<'card' | 'upi'>('upi');

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
    <div className="mx-auto max-w-lg">
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'CHECKOUT' }]} />
      <div className="mt-6">
        <Stepper steps={steps} current={2} />
      </div>
      <h1 className="page-title mt-8">The final step.</h1>
      <p className="mt-3 text-sm text-muted">Complete your order securely.</p>

      <div className="panel mt-8 p-5">
        <div className="flex justify-between text-sm">
          <span className="font-semibold">Order summary</span>
          <span className="text-muted">
            {cart?.items.length ?? 0} {(cart?.items.length ?? 0) === 1 ? 'item' : 'items'}
          </span>
        </div>
        <ul className="mt-4 space-y-4 border-b border-border pb-4">
          {cart?.items.map((i) => (
            <li key={i.variantId} className="flex gap-3 text-sm">
              {i.product.image ? (
                <img
                  src={i.product.image}
                  alt=""
                  className="h-14 w-14 rounded-[8px] border border-border object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-[8px] border border-border bg-panel-2 text-[10px] uppercase text-muted">
                  {i.product.name.slice(0, 2)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{i.product.name}</p>
                <p className="text-xs text-muted">
                  {Object.values(i.attributes).join(' · ') || 'Standard'}
                </p>
                <p className="text-xs text-muted">Qty: {i.quantity}</p>
              </div>
              <p className="shrink-0 font-medium">{formatINR(i.lineTotal)}</p>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>{formatINR(cart?.subtotal ?? 0)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-[#d4ff3f]">
              <span>Discount</span>
              <span>-{formatINR(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
            <span>Order total</span>
            <span>{formatINR(total)}</span>
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

      <div className="mt-6">
        <h2 className="text-sm font-semibold">Select payment method</h2>
        <ul className="mt-3 space-y-3">
          <li>
            <button
              type="button"
              onClick={() => setPayMethod('upi')}
              className={`payment-option w-full text-left ${payMethod === 'upi' ? 'payment-option-selected' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    payMethod === 'upi' ? 'border-[#d4ff3f] bg-[#d4ff3f]' : 'border-border'
                  }`}
                >
                  {payMethod === 'upi' ? <span className="h-1.5 w-1.5 rounded-full bg-accent-fg" /> : null}
                </span>
                <div>
                  <p className="font-medium">UPI</p>
                  <p className="text-xs text-muted">Pay using any UPI app.</p>
                  <UpiMarks />
                </div>
              </div>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => setPayMethod('card')}
              className={`payment-option w-full text-left ${payMethod === 'card' ? 'payment-option-selected' : ''}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                    payMethod === 'card' ? 'border-[#d4ff3f] bg-[#d4ff3f]' : 'border-border'
                  }`}
                >
                  {payMethod === 'card' ? <span className="h-1.5 w-1.5 rounded-full bg-accent-fg" /> : null}
                </span>
                <div className="flex items-center gap-2">
                  <IconCreditCard className="h-5 w-5 text-muted" />
                  <div>
                    <p className="font-medium">Credit or debit card</p>
                    <p className="text-xs text-muted">Visa, Mastercard, Amex</p>
                  </div>
                </div>
              </div>
            </button>
          </li>
        </ul>

        {clientSecret && orderId ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PayForm orderId={orderId} />
          </Elements>
        ) : (
          <div className="mt-6">
            <button type="button" className="btn-primary w-full" disabled>
              Preparing secure checkout…
            </button>
            <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-muted">
              <IconLock className="h-3.5 w-3.5" />
              Complete payment securely on the provider page.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
