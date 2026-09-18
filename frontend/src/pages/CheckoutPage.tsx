import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ orderId }: { orderId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });
    if (error) {
      toast.error(error.message ?? 'Payment failed');
      setSubmitting(false);
      return;
    }
    if (paymentIntent?.status === 'succeeded') {
      navigate(`/orders/${orderId}`);
    } else {
      toast('Payment processing — check order history shortly.');
      navigate('/orders');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <button type="submit" disabled={!stripe || submitting} className="btn-primary w-full">
        {submitting ? 'Processing…' : 'Pay now'}
      </button>
    </form>
  );
}

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const cartIdParam = searchParams.get('cartId');
  const { carts, cart, refresh, selectCart } = useCart();
  const [checkoutCart, setCheckoutCart] = useState(cart);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discountPreview, setDiscountPreview] = useState<{
    discountAmount: number;
    total: number;
  } | null>(null);
  const [address, setAddress] = useState({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
  });

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (cartIdParam) selectCart(cartIdParam);
  }, [cartIdParam, selectCart]);

  useEffect(() => {
    const c = cartIdParam ? carts.find((x) => x.id === cartIdParam) ?? cart : cart;
    setCheckoutCart(c);
  }, [cartIdParam, carts, cart]);

  async function applyCouponPreview() {
    if (!couponCode.trim() || !checkoutCart) return;
    try {
      const sellerIds = checkoutCart.items.map((i) => i.product.sellerId);
      const res = await api.post('/coupons/preview', {
        code: couponCode.trim(),
        subtotal: checkoutCart.subtotal,
        sellerIds,
      });
      setDiscountPreview({
        discountAmount: res.data.data.discountAmount,
        total: res.data.data.total,
      });
      toast.success('Coupon applied');
    } catch (err: any) {
      setDiscountPreview(null);
      toast.error(err.response?.data?.message ?? 'Invalid coupon');
    }
  }

  async function startCheckout(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await api.post('/checkout/payment-intent', {
        shippingAddress: address,
        cartId: checkoutCart?.id,
        couponCode: couponCode.trim() || undefined,
      });
      setClientSecret(res.data.data.clientSecret);
      setOrderId(res.data.data.orderId);
      setDiscountPreview({
        discountAmount: res.data.data.discountAmount,
        total: res.data.data.total,
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Could not start checkout');
    }
  }

  if (!checkoutCart?.items.length) {
    return <p className="text-muted">Your cart is empty.</p>;
  }

  const total = discountPreview?.total ?? checkoutCart.subtotal;
  const discount = discountPreview?.discountAmount ?? 0;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="glass rounded-2xl p-6">
        <h1 className="font-display text-3xl font-bold">Checkout</h1>
        <p className="text-sm text-muted">Cart: {checkoutCart.name}</p>
        {!clientSecret ? (
          <form onSubmit={startCheckout} className="mt-6 grid gap-3 sm:grid-cols-2">
            <input className="input-field sm:col-span-2" placeholder="Full name" required value={address.fullName} onChange={(e) => setAddress({ ...address, fullName: e.target.value })} />
            <input className="input-field sm:col-span-2" placeholder="Address line 1" required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
            <input className="input-field sm:col-span-2" placeholder="Address line 2" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
            <input className="input-field" placeholder="City" required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            <input className="input-field" placeholder="State" required value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
            <input className="input-field" placeholder="Postal code" required value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
            <input className="input-field" placeholder="Phone" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
            <div className="flex gap-2 sm:col-span-2">
              <input
                className="input-field flex-1"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <button type="button" className="btn-ghost" onClick={applyCouponPreview}>
                Apply
              </button>
            </div>
            <button type="submit" className="btn-primary sm:col-span-2">Continue to payment</button>
          </form>
        ) : (
          orderId && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <div className="mt-6">
                <CheckoutForm orderId={orderId} />
              </div>
            </Elements>
          )
        )}
      </div>
      <aside className="glass h-fit rounded-2xl p-6">
        <h2 className="font-display text-xl font-semibold">Order</h2>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          {checkoutCart.items.map((i) => (
            <li key={i.variantId} className="flex justify-between gap-2">
              <span>{i.product.name} × {i.quantity}</span>
              <span>${i.lineTotal.toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1 border-t border-border pt-4 text-sm">
          <div className="flex justify-between text-muted">
            <span>Subtotal</span>
            <span>${checkoutCart.subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-accent">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}
