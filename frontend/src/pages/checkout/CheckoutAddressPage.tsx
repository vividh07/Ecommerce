import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { Breadcrumbs } from '../../components/layout/ShopNavbar';
import { Stepper } from '../../components/ui/Stepper';
import { IconLock } from '../../components/icons/Icons';
import { saveCheckoutDraft } from '../../lib/checkoutDraft';
import { formatINR } from '../../lib/money';
import { productImageSrc } from '../../lib/productImage';

const steps = [
  { id: 'address', label: 'Address' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
];

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
    country: 'IN',
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
    return (
      <p className="mt-8 text-muted">
        Your bag is empty.{' '}
        <Link to="/browse" className="text-accent underline">
          Continue shopping
        </Link>
      </p>
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/' }, { label: 'CHECKOUT' }]} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="page-title">Make it yours.</h1>
        <p className="text-sm text-muted">
          Checking out as a guest?{' '}
          <Link to="/login" className="font-medium text-accent underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 max-w-xl">
        <Stepper steps={steps} current={0} />
      </div>

      <form onSubmit={submit} className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-14">
        <div className="space-y-10">
          <section>
            <h2 className="font-semibold">Contact information</h2>
            <div className="mt-4">
              <label className="mb-1.5 block text-xs text-muted">Email address</label>
              <input
                className="input-field"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </section>

          <section>
            <h2 className="font-semibold">Delivery address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs text-muted">Full name</label>
                <input
                  className="input-field"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs text-muted">Mobile number</label>
                <input
                  className="input-field"
                  required
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs text-muted">Address (House no., building, street)</label>
                <input
                  className="input-field"
                  required
                  value={form.line1}
                  onChange={(e) => setForm({ ...form, line1: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted">City</label>
                <input
                  className="input-field"
                  required
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-muted">State</label>
                <select
                  className="input-field"
                  required
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs text-muted">PIN code</label>
                <input
                  className="input-field"
                  required
                  inputMode="numeric"
                  maxLength={6}
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold">Delivery option</h2>
            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-[8px] border border-border p-4">
              <span className="flex items-center gap-3">
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                    delivery === 'standard' ? 'border-accent' : 'border-border'
                  }`}
                >
                  {delivery === 'standard' && <span className="h-2 w-2 rounded-full bg-accent" />}
                </span>
                <span>
                  <span className="block text-sm font-medium">Standard delivery</span>
                  <span className="text-xs text-muted">3–6 business days</span>
                </span>
              </span>
              <span className="text-sm font-medium text-accent">Free</span>
              <input
                type="radio"
                name="delivery"
                className="sr-only"
                checked={delivery === 'standard'}
                onChange={() => setDelivery('standard')}
              />
            </label>
          </section>
        </div>

        <aside className="h-fit rounded-[12px] border border-border bg-panel p-6">
          <h3 className="font-semibold">Order summary</h3>
          <ul className="mt-5 space-y-4">
            {cart.items.map((i) => {
              const color = i.attributes?.color || i.attributes?.Color;
              return (
                <li key={i.variantId} className="flex gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[8px] bg-[#151515]">
                    {i.product.image && (
                      <img src={productImageSrc(i.product.image)} alt="" className="h-full w-full object-contain p-1" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{i.product.name}</p>
                    <p className="text-xs text-muted">
                      {color ? `Color: ${color}` : i.sku}
                      {' · '}Qty {i.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium">{formatINR(i.lineTotal)}</p>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="text-text">{formatINR(cart.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Delivery</span>
              <span className="text-accent">Free</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold text-text">
              <span>Total</span>
              <span>{formatINR(cart.subtotal)}</span>
            </div>
          </div>
          <button type="submit" className="btn-primary mt-6 w-full">
            Continue to payment →
          </button>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted">
            <IconLock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Next step: choose UPI or card to complete your order.
          </p>
        </aside>
      </form>
    </div>
  );
}
