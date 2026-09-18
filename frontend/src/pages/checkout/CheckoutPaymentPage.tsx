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
    <form onSubmit={onSubmit} className="space-y-4">
      <PaymentElement />
      <button type="submit" className="btn-primary w-full" disabled={!stripe || busy}>
        Continue to payment provider →
      </button>
      <p className="text-center text-xs text-muted">🔒 Complete payment securely on the provider page.</p>
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
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">Order summary</span>
            <span className="text-muted">{cart?.items.length} items</span>
          </div>
          <ul className="mt-4 space-y-3 border-b border-border pb-4">
            {cart?.items.map((i) => (
              <li key={i.variantId} className="flex gap-3 text-sm">
                {i.product.image && <img src={i.product.image} alt="" className="h-12 w-12 rounded-[8px] border border-border object-cover" />}
                <div className="flex-1">
                  <p className="font-medium">{i.product.name}</p>
                  <p className="text-muted">Qty {i.quantity}</p>
                </div>
                <p>${i.lineTotal.toFixed(2)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span>${cart?.subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-accent"><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
            <div className="flex justify-between text-lg font-semibold pt-2"><span>Order total</span><span>${total.toFixed(2)}</span></div>
          </div>
          <div className="mt-4 flex gap-2">
            <input className="input-field flex-1" placeholder="Promo code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
            <button type="button" className="btn-outline" onClick={() => {
              const d = loadCheckoutDraft();
              if (d) saveCheckoutDraft({ ...d, couponCode });
              window.location.reload();
            }}>Apply</button>
          </div>
        </div>
        <div className="card p-6">
          <h2 className="font-semibold">Select payment method</h2>
          {clientSecret && orderId ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <div className="mt-4"><PayForm orderId={orderId} /></div>
            </Elements>
          ) : (
            <p className="mt-4 text-muted">Preparing secure checkout…</p>
          )}
        </div>
      </div>
    </div>
  );
}
