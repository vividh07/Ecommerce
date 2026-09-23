import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../lib/api';
import { formatINR } from '../../lib/money';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Breadcrumbs } from '../../components/layout/ShopNavbar';
import { Stepper } from '../../components/ui/Stepper';
import { IconCreditCard, IconLock } from '../../components/icons/Icons';
import { loadCheckoutDraft, clearCheckoutDraft, saveCheckoutDraft } from '../../lib/checkoutDraft';

const steps = [
  { id: 'cart', label: 'Cart' },
  { id: 'shipping', label: 'Shipping' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: { error?: { description?: string } }) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
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

type CheckoutSession = {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderId: string;
};

export function CheckoutPaymentPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, activeCartId, refresh } = useCart();
  const cartId = params.get('cartId') ?? activeCartId;
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [payMethod, setPayMethod] = useState<'card' | 'upi'>('upi');
  const [busy, setBusy] = useState(false);
  const creating = useRef(false);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const draft = loadCheckoutDraft();
    if (!draft || !cart?.items.length || creating.current || session) return;
    creating.current = true;
    (async () => {
      try {
        const res = await api.post('/checkout/create-order', {
          shippingAddress: {
            fullName: draft.shippingAddress.fullName,
            line1: draft.shippingAddress.line1,
            line2: draft.shippingAddress.line2,
            city: draft.shippingAddress.city,
            state: draft.shippingAddress.state,
            postalCode: draft.shippingAddress.postalCode,
            country: draft.shippingAddress.country || 'IN',
            phone: draft.shippingAddress.phone,
          },
          cartId,
          couponCode: draft.couponCode || couponCode || undefined,
        });
        const data = res.data.data;
        setSession({
          keyId: data.keyId,
          razorpayOrderId: data.razorpayOrderId,
          amount: data.amount,
          currency: data.currency,
          orderId: data.orderId,
        });
        setDiscount(data.discountAmount ?? 0);
      } catch (err: any) {
        toast.error(err.response?.data?.message ?? 'Checkout failed');
        creating.current = false;
      }
    })();
  }, [cart, cartId, session, couponCode]);

  async function cancelSessionOrder(orderId: string) {
    try {
      await api.post('/checkout/cancel', { orderId });
    } catch {
      /* best-effort */
    }
  }

  async function openRazorpay() {
    if (!session) return;
    setBusy(true);
    const ok = await loadRazorpayScript();
    if (!ok || !window.Razorpay) {
      toast.error('Could not load Razorpay Checkout');
      setBusy(false);
      return;
    }

    const preferred = payMethod === 'upi' ? ['upi', 'card', 'netbanking', 'wallet'] : ['card', 'upi', 'netbanking', 'wallet'];
    const current = session;

    const rzp = new window.Razorpay({
      key: current.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: current.amount,
      currency: current.currency,
      name: 'LUMEN',
      description: `Order ${current.orderId.slice(-8).toUpperCase()}`,
      order_id: current.razorpayOrderId,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
      },
      theme: { color: '#b8e600' },
      config: {
        display: {
          sequence: preferred,
          preferences: { show_default_blocks: true },
        },
      },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          await api.post('/checkout/verify', {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
          clearCheckoutDraft();
          await refresh();
          navigate(`/orders/confirmation/${current.orderId}`);
        } catch (err: any) {
          toast.error(err.response?.data?.message ?? 'Payment verification failed');
          await cancelSessionOrder(current.orderId);
          setSession(null);
          creating.current = false;
          setBusy(false);
        }
      },
      modal: {
        ondismiss: async () => {
          await cancelSessionOrder(current.orderId);
          setSession(null);
          creating.current = false;
          setBusy(false);
          toast('Payment cancelled — order was not placed');
        },
      },
    });

    rzp.on('payment.failed', async (resp) => {
      toast.error(resp.error?.description ?? 'Payment failed');
      await cancelSessionOrder(current.orderId);
      setSession(null);
      creating.current = false;
      setBusy(false);
    });

    rzp.open();
  }

  const total = Math.max(0, (cart?.subtotal ?? 0) - discount);

  return (
    <div className="mx-auto max-w-lg">
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'CHECKOUT' }]} />
      <div className="mt-6">
        <Stepper steps={steps} current={2} />
      </div>
      <h1 className="page-title mt-8">The final step.</h1>
      <p className="mt-3 text-sm text-muted">Pay securely with Razorpay (UPI, cards, wallets).</p>

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
              creating.current = false;
              setSession(null);
              window.location.reload();
            }}
          >
            Apply
          </button>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-sm font-semibold">Preferred payment method</h2>
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
                  <p className="text-xs text-muted">GPay, PhonePe, Paytm, BHIM — via Razorpay.</p>
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
                    <p className="text-xs text-muted">Visa, Mastercard, RuPay, Amex</p>
                  </div>
                </div>
              </div>
            </button>
          </li>
        </ul>

        <div className="mt-6">
          <button
            type="button"
            className="btn-primary w-full"
            disabled={!session || busy}
            onClick={openRazorpay}
          >
            {busy ? 'Opening Razorpay…' : session ? `Pay ${formatINR(total)}` : 'Preparing checkout…'}
          </button>
          <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-muted">
            <IconLock className="h-3.5 w-3.5" />
            Secured by Razorpay. Test mode keys work with Razorpay test cards / UPI.
          </p>
        </div>
      </div>
    </div>
  );
}
