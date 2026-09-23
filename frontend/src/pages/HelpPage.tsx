import { type FormEvent, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import {
  IconChevronDown,
  IconChevronRight,
  IconChevronUp,
  IconCreditCard,
  IconPackage,
  IconSearch,
  IconTruck,
  IconUser,
} from '../components/icons/Icons';

type FaqItem = { q: string; a: ReactNode };

const TOPICS = [
  {
    id: 'orders',
    label: 'Orders & payments',
    icon: IconCreditCard,
    description: 'Find answers to common questions about placing orders, payments and more.',
    faqs: [
      {
        q: 'Where can I find my order?',
        a: (
          <>
            Sign in and open{' '}
            <Link to="/orders" className="underline hover:text-accent">
              My orders
            </Link>{' '}
            to view your order status.
          </>
        ),
      },
      {
        q: 'Can I change an order?',
        a: 'Orders can usually be updated within a short window after placement. Contact us with your order number and we will check what is possible.',
      },
      {
        q: 'Which payment options are available?',
        a: 'We accept major cards and other checkout options shown at payment. All amounts are charged in INR.',
      },
      {
        q: 'How do I request a return?',
        a: (
          <>
            Start a return from your order details, or read our{' '}
            <Link to="/shipping-returns" className="underline hover:text-accent">
              Shipping & returns
            </Link>{' '}
            policy.
          </>
        ),
      },
      {
        q: 'How do I reset my password?',
        a: (
          <>
            From{' '}
            <Link to="/account/settings" className="underline hover:text-accent">
              Account settings
            </Link>
            , or use the forgot-password link on the login page.
          </>
        ),
      },
    ] as FaqItem[],
  },
  {
    id: 'delivery',
    label: 'Delivery',
    icon: IconTruck,
    description: 'Shipping times, tracking and what to expect after you order.',
    faqs: [
      {
        q: 'Where do you deliver?',
        a: 'We deliver across India. Delivery windows appear at checkout based on your address.',
      },
      {
        q: 'How can I track my order?',
        a: (
          <>
            Use{' '}
            <Link to="/shipping-returns#track" className="underline hover:text-accent">
              Track order
            </Link>{' '}
            with your order number and email, or check My orders when signed in.
          </>
        ),
      },
      {
        q: 'What happens if my order is delayed?',
        a: 'We will update tracking as soon as the carrier provides new information. Contact us if your delivery window has passed.',
      },
    ] as FaqItem[],
  },
  {
    id: 'returns',
    label: 'Returns',
    icon: IconPackage,
    description: 'How returns work, timelines and refunds.',
    faqs: [
      {
        q: 'How long do I have to return an item?',
        a: 'Most items can be returned within 30 days of delivery in unused condition with original packaging.',
      },
      {
        q: 'How do refunds work?',
        a: 'Once we receive and review your return, refunds are issued to the original payment method.',
      },
      {
        q: 'What if an item arrives damaged?',
        a: 'Contact us with photos and your order number — we will arrange a replacement or refund.',
      },
    ] as FaqItem[],
  },
  {
    id: 'account',
    label: 'Account',
    icon: IconUser,
    description: 'Sign-in, profile and wishlist help.',
    faqs: [
      {
        q: 'How do I update my details?',
        a: (
          <>
            Visit{' '}
            <Link to="/account/settings" className="underline hover:text-accent">
              Account settings
            </Link>{' '}
            to update your name and preferences.
          </>
        ),
      },
      {
        q: 'Where is my wishlist?',
        a: (
          <>
            Open{' '}
            <Link to="/wishlist" className="underline hover:text-accent">
              Wishlist
            </Link>{' '}
            from the heart icon in the header when signed in.
          </>
        ),
      },
    ] as FaqItem[],
  },
];

export function HelpPage() {
  const [activeId, setActiveId] = useState('orders');
  const [openQ, setOpenQ] = useState<string | null>('Where can I find my order?');
  const [query, setQuery] = useState('');
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const topic = TOPICS.find((t) => t.id === activeId) ?? TOPICS[0];

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return topic.faqs;
    return topic.faqs.filter(
      (f) => f.q.toLowerCase().includes(q) || (typeof f.a === 'string' && f.a.toLowerCase().includes(q))
    );
  }, [topic, query]);

  async function subscribe(e: FormEvent) {
    e.preventDefault();
    setSubscribing(true);
    try {
      await api.post('/site/newsletter', { email, source: 'help' });
      toast.success('You are subscribed');
      setEmail('');
    } catch {
      toast.error('Could not subscribe');
    } finally {
      setSubscribing(false);
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/' }, { label: 'HELP' }]} />

      <div className="mt-8 text-center">
        <h1 className="page-title text-[clamp(2.5rem,6vw,4.25rem)]">
          Good questions.
          <br />
          <span className="text-accent">Clear answers.</span>
        </h1>
        <div className="relative mx-auto mt-8 max-w-xl">
          <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="search"
            className="input-pill py-3.5 text-sm"
            placeholder="Search for an answer"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActiveId(t.id);
                setOpenQ(t.faqs[0]?.q ?? null);
              }}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                activeId === t.id
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border text-muted hover:border-white/20 hover:text-text'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[240px_1fr] lg:gap-14">
        <aside>
          <p className="text-sm font-semibold">Help Centre</p>
          <nav className="mt-4 space-y-1">
            {TOPICS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveId(t.id);
                  setOpenQ(t.faqs[0]?.q ?? null);
                }}
                className={`flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-sm transition ${
                  activeId === t.id ? 'bg-white/5 text-text' : 'text-muted hover:bg-white/5 hover:text-text'
                }`}
              >
                <t.icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{t.label}</span>
                <IconChevronRight className="h-3.5 w-3.5 opacity-50" />
              </button>
            ))}
          </nav>
          <p className="mt-8 text-sm text-muted">
            Still can&apos;t find what you&apos;re looking for?{' '}
            <Link to="/contact" className="font-medium text-accent hover:underline">
              Contact us →
            </Link>
          </p>
        </aside>

        <div>
          <h2 className="text-2xl font-semibold">{topic.label}</h2>
          <p className="mt-2 text-sm text-muted">{topic.description}</p>
          <div className="mt-6 divide-y divide-border border-y border-border">
            {filteredFaqs.map((faq) => {
              const open = openQ === faq.q;
              return (
                <div key={faq.q}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    onClick={() => setOpenQ(open ? null : faq.q)}
                  >
                    <span className="font-medium">{faq.q}</span>
                    {open ? (
                      <IconChevronUp className="h-4 w-4 shrink-0 text-muted" />
                    ) : (
                      <IconChevronDown className="h-4 w-4 shrink-0 text-muted" />
                    )}
                  </button>
                  {open && <div className="pb-4 text-sm leading-relaxed text-muted">{faq.a}</div>}
                </div>
              );
            })}
            {filteredFaqs.length === 0 && (
              <p className="py-6 text-sm text-muted">No matching answers. Try another topic or contact us.</p>
            )}
          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="mt-16 overflow-hidden rounded-[16px] border border-border bg-gradient-to-r from-[#161616] to-[#111]">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-semibold md:text-3xl">Still need a hand?</h2>
            <p className="mt-3 max-w-md text-sm text-muted">
              Our support team is here to help. Get in touch and we&apos;ll respond as soon as possible.
            </p>
            <Link to="/contact" className="btn-primary mt-6 inline-flex rounded-full">
              Contact us <IconChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative hidden aspect-[4/3] md:block">
            <img
              src="/images/shop/products/headphones-silver.png"
              alt=""
              className="absolute inset-0 h-full w-full object-contain p-8"
            />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mt-16 pb-4 text-center">
        <h2 className="page-title text-[clamp(1.75rem,4vw,2.75rem)]">
          Stay in the loop / <span className="text-accent">Get the latest</span>
        </h2>
        <p className="mt-3 text-sm text-muted">
          Be the first to know about new arrivals, exclusive offers and more.
        </p>
        <form onSubmit={subscribe} className="mx-auto mt-6 flex max-w-lg flex-col gap-2 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="input-field flex-1"
          />
          <button type="submit" disabled={subscribing} className="btn-primary shrink-0">
            Subscribe
          </button>
        </form>
        <p className="mt-3 text-xs text-muted">By subscribing, you agree to receive marketing emails from LUMEN.</p>
      </section>
    </div>
  );
}
