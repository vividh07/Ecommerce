import { type FormEvent, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import {
  IconBag,
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconMessage,
  IconPackage,
  IconTruck,
} from '../components/icons/Icons';

type TrackResult = {
  orderId: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  history: { status: string; timestamp: string; note?: string }[];
};

const SHIPPING_FAQS = [
  {
    q: 'Where do you deliver?',
    a: 'We deliver across India. Estimated delivery windows are shown at checkout based on your address.',
  },
  {
    q: 'How can I track my order?',
    a: 'Use the track form on this page with your order number and email, or open My orders when signed in.',
  },
  {
    q: 'What happens if my order is delayed?',
    a: 'Carrier updates can lag. If your delivery window has passed, contact us with your order number and we will investigate.',
  },
  {
    q: 'Can I change my delivery address?',
    a: 'Address changes are sometimes possible before the order ships. Contact us as soon as you can.',
  },
  {
    q: "My tracking hasn't updated.",
    a: 'Tracking can take 24–48 hours after dispatch to show movement. If nothing appears after that, get in touch.',
  },
];

const RETURNS_FAQS = [
  {
    q: 'How do I start a return?',
    a: 'Open the order in My orders and follow the return request flow, or contact us with your order number.',
  },
  {
    q: 'What is the return window?',
    a: 'Most items can be returned within 30 days of delivery if unused and in original packaging.',
  },
  {
    q: 'When will I get my refund?',
    a: 'After we receive and review your return, refunds go back to the original payment method, usually within a few business days.',
  },
  {
    q: 'Who pays for return shipping?',
    a: 'Defective or incorrect items are returned at our cost. Other returns may use a prepaid label or standard rates shown in the return flow.',
  },
];

function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="divide-y divide-border border-y border-border">
      {items.map((item) => {
        const isOpen = open === item.q;
        return (
          <div key={item.q}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
              onClick={() => setOpen(isOpen ? null : item.q)}
            >
              <span className="font-medium">{item.q}</span>
              {isOpen ? (
                <IconChevronUp className="h-4 w-4 shrink-0 text-muted" />
              ) : (
                <IconChevronDown className="h-4 w-4 shrink-0 text-muted" />
              )}
            </button>
            {isOpen && <p className="pb-4 text-sm leading-relaxed text-muted">{item.a}</p>}
          </div>
        );
      })}
    </div>
  );
}

export function ShippingReturnsPage() {
  const location = useLocation();
  const [tab, setTab] = useState<'shipping' | 'returns'>('shipping');
  const [orderNumber, setOrderNumber] = useState('');
  const [email, setEmail] = useState('');
  const [tracking, setTracking] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);

  useEffect(() => {
    if (location.hash === '#track') {
      document.getElementById('track')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  async function trackOrder(e: FormEvent) {
    e.preventDefault();
    setTracking(true);
    setResult(null);
    try {
      const res = await api.post('/site/track-order', { orderNumber, email });
      setResult(res.data.data);
      toast.success('Order found');
    } catch {
      toast.error('No order found for that email and order number');
    } finally {
      setTracking(false);
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/' }, { label: 'SHIPPING & RETURNS' }]} />

      <div className="relative mt-8">
        <div className="pointer-events-none absolute right-0 top-0 hidden lg:block">
          <p className="origin-top-right rotate-90 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.35em] text-white/45">
            GOOD THINGS GO FURTHER
          </p>
          <span className="mt-3 ml-auto block h-8 w-px bg-white/25" />
        </div>
        <h1 className="page-title max-w-3xl text-[clamp(2.5rem,6vw,4.25rem)]">
          From our door <span className="text-accent">to yours.</span>
        </h1>
        <p className="mt-4 text-base text-muted md:text-lg">Delivery and returns, explained clearly.</p>

        <div className="mt-8 flex gap-3">
          <button
            type="button"
            onClick={() => setTab('shipping')}
            className={`rounded-[8px] px-5 py-2.5 text-sm font-semibold transition ${
              tab === 'shipping'
                ? 'bg-accent text-accent-fg'
                : 'border border-border text-text hover:bg-white/5'
            }`}
          >
            Shipping
          </button>
          <button
            type="button"
            onClick={() => setTab('returns')}
            className={`rounded-[8px] px-5 py-2.5 text-sm font-semibold transition ${
              tab === 'returns'
                ? 'bg-accent text-accent-fg'
                : 'border border-border text-text hover:bg-white/5'
            }`}
          >
            Returns
          </button>
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <div>
          {tab === 'shipping' ? (
            <>
              <h2 className="text-xl font-semibold">Delivery options</h2>
              <div className="mt-4 overflow-hidden rounded-[12px] border border-border bg-[#151515]">
                <img
                  src="/images/shop/products/headphones-folded.png"
                  alt=""
                  className="aspect-[16/9] w-full object-contain p-8"
                />
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Standard delivery typically arrives in 3–6 business days depending on your location.
                Express options may be available at checkout.
              </p>

              <h3 className="mt-10 text-lg font-semibold">Tracking your order</h3>
              <div className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
                {[
                  { icon: IconBag, label: 'Confirmed' },
                  { icon: IconPackage, label: 'Shipped' },
                  { icon: IconTruck, label: 'Delivered' },
                ].map((step, i, arr) => (
                  <div key={step.label} className="flex flex-1 items-center gap-3">
                    <div className="flex flex-col items-center gap-2">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border">
                        <step.icon className="h-5 w-5 text-accent" />
                      </span>
                      <span className="text-sm font-medium">{step.label}</span>
                    </div>
                    {i < arr.length - 1 && (
                      <div className="mb-6 hidden h-px flex-1 bg-border sm:block" />
                    )}
                  </div>
                ))}
              </div>

              <h3 className="mt-10 text-lg font-semibold">Delivery questions</h3>
              <div className="mt-4">
                <Accordion items={SHIPPING_FAQS} />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold">Returns made simple</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Changed your mind? Most items can be returned within 30 days. Start from your order
                details or use the card on the right for a quick overview.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {['1. Request', '2. Send back', '3. Review'].map((label) => (
                  <div key={label} className="rounded-[12px] border border-border bg-panel p-5 text-center">
                    <p className="font-semibold">{label}</p>
                  </div>
                ))}
              </div>
              <h3 className="mt-10 text-lg font-semibold">Returns questions</h3>
              <div className="mt-4">
                <Accordion items={RETURNS_FAQS} />
              </div>
            </>
          )}
        </div>

        <aside className="space-y-4">
          <div id="track" className="scroll-mt-28 rounded-[12px] border border-border bg-panel p-6">
            <h3 className="text-lg font-semibold">Track your order</h3>
            <form onSubmit={trackOrder} className="mt-5 space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-sm text-muted">Order number</span>
                <input
                  className="input-field"
                  placeholder="e.g. #123456"
                  required
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm text-muted">Email address</span>
                <input
                  type="email"
                  className="input-field"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
              <button type="submit" disabled={tracking} className="btn-primary w-full">
                Track order <IconChevronRight className="h-4 w-4" />
              </button>
            </form>
            {result && (
              <div className="mt-5 rounded-[8px] border border-border bg-panel-2 p-4 text-sm">
                <p className="font-semibold">{result.orderNumber}</p>
                <p className="mt-1 text-muted">Status: {result.status}</p>
                {result.history?.length > 0 && (
                  <ul className="mt-3 space-y-1 text-muted">
                    {result.history.map((h, i) => (
                      <li key={`${h.status}-${i}`}>
                        {h.status}
                        {h.timestamp ? ` · ${new Date(h.timestamp).toLocaleDateString('en-IN')}` : ''}
                      </li>
                    ))}
                  </ul>
                )}
                <Link
                  to={`/orders/${result.orderId}`}
                  className="mt-3 inline-block text-accent hover:underline"
                >
                  View order details →
                </Link>
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-[12px] border border-border bg-panel">
            <div className="aspect-[16/10] bg-[#151515]">
              <img
                src="/images/shop/products/lamp-orange.png"
                alt=""
                className="h-full w-full object-contain p-6"
              />
            </div>
            <div className="p-6">
              <h3 className="font-semibold">Need to send something back?</h3>
              <div className="mt-4 flex justify-between gap-2 text-center text-xs text-muted">
                <span>1. Request</span>
                <span>2. Send back</span>
                <span>3. Review</span>
              </div>
              <Link to="/orders" className="btn-primary mt-5 w-full">
                View my orders <IconChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-[12px] border border-border bg-panel p-6">
            <IconMessage className="h-5 w-5 text-accent" />
            <p className="mt-3 text-sm text-muted">Still have a question? We&apos;re here to help.</p>
            <Link to="/contact" className="btn-outline mt-4 w-full">
              Get in touch <IconChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
