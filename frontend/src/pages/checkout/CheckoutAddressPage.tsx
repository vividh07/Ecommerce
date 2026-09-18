import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Breadcrumbs } from '../../components/layout/ShopNavbar';
import { Stepper } from '../../components/ui/Stepper';
import { saveCheckoutDraft } from '../../lib/checkoutDraft';

const steps = [
  { id: 'address', label: 'Address' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
];

export function CheckoutAddressPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { cart, activeCartId } = useCart();
  const cartId = params.get('cartId') ?? activeCartId ?? undefined;
  const [delivery, setDelivery] = useState<'standard' | 'express'>('standard');
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    saveCheckoutDraft({
      shippingAddress: form,
      deliveryOption: delivery,
      cartId,
    });
    navigate(`/checkout/payment${cartId ? `?cartId=${cartId}` : ''}`);
  }

  if (!cart?.items.length) {
    return <p className="text-muted">Your bag is empty.</p>;
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'CHECKOUT' }]} />
      <h1 className="page-title mt-4">Make it yours.</h1>
      <div className="mt-8 max-w-2xl">
        <Stepper steps={steps} current={0} />
      </div>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="space-y-8">
          <section>
            <h2 className="font-semibold">Contact information</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className="input-field sm:col-span-2" placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <input className="input-field" placeholder="Full name" required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <input className="input-field" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </section>
          <section>
            <h2 className="font-semibold">Delivery address</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className="input-field sm:col-span-2" placeholder="Address line 1" required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
              <input className="input-field sm:col-span-2" placeholder="Address line 2" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} />
              <input className="input-field" placeholder="City" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input className="input-field" placeholder="State" required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              <input className="input-field sm:col-span-2" placeholder="Postal code" required value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
            </div>
          </section>
          <section>
            <h2 className="font-semibold">Delivery option</h2>
            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-[8px] border border-border p-4">
              <span className="flex items-center gap-3">
                <input type="radio" name="delivery" checked={delivery === 'standard'} onChange={() => setDelivery('standard')} className="accent-accent" />
                Standard delivery
              </span>
              <span className="text-accent">Free</span>
            </label>
          </section>
          <button type="submit" className="btn-primary w-full sm:w-auto">Continue to payment →</button>
        </form>
        <aside className="card h-fit p-6">
          <h3 className="font-semibold">Order summary</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {cart.items.map((i) => (
              <li key={i.variantId} className="flex justify-between gap-2 text-muted">
                <span>{i.product.name} × {i.quantity}</span>
                <span>${i.lineTotal.toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-border pt-4 flex justify-between font-semibold">
            <span>Total</span>
            <span>${cart.subtotal.toFixed(2)}</span>
          </div>
        </aside>
      </div>
      <p className="mt-6 text-sm text-muted">
        Checking out as a guest? <Link to="/login" className="text-accent underline">Sign in</Link>
      </p>
    </div>
  );
}
