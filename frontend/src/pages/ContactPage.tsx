import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { IconChevronRight, IconDocument, IconPackage } from '../components/icons/Icons';

const TOPICS = [
  'Order question',
  'Delivery',
  'Returns',
  'Product question',
  'Account',
  'Other',
] as const;

const INFO_CARDS = [
  {
    title: 'Order help',
    text: 'Check your order status anytime with your order number and email.',
    linkLabel: 'Track your order →',
    to: '/shipping-returns#track',
    image: '/images/shop/products/headphones-folded.png',
  },
  {
    title: 'Quick answers',
    text: 'Find instant answers to common questions in our help centre.',
    linkLabel: 'Visit help centre →',
    to: '/help',
    image: '/images/shop/products/tote-olive.png',
  },
  {
    title: 'Email us',
    text: 'Prefer email? Reach our team directly.',
    linkLabel: 'support@example.com',
    to: 'mailto:support@example.com',
    image: '/images/shop/products/sling-olive.png',
    external: true,
  },
];

export function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<(typeof TOPICS)[number]>('Order question');
  const [orderNumber, setOrderNumber] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/site/contact', {
        name,
        email,
        topic,
        orderNumber: orderNumber || undefined,
        message,
      });
      toast.success('Message sent');
      setName('');
      setEmail('');
      setTopic('Order question');
      setOrderNumber('');
      setMessage('');
    } catch {
      toast.error('Could not send message');
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/' }, { label: 'CONTACT' }]} />

      <div className="mt-8 max-w-2xl">
        <h1 className="page-title text-[clamp(2.5rem,6vw,4.25rem)]">
          Let&apos;s <span className="text-accent">sort</span> it.
        </h1>
        <p className="mt-4 text-base text-muted md:text-lg">
          A question about an order or something you&apos;ve spotted? We&apos;re here to help.
        </p>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10">
        <form onSubmit={onSubmit} className="rounded-[12px] border border-border bg-[#111] p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Send us a message</h2>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted">Your name</span>
              <input
                className="input-field"
                placeholder="John Doe"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
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
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted">Topic</span>
              <select
                className="input-field"
                value={topic}
                onChange={(e) => setTopic(e.target.value as (typeof TOPICS)[number])}
              >
                {TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted">Order number (optional)</span>
              <input
                className="input-field"
                placeholder="e.g. #12345"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm text-muted">Message</span>
              <textarea
                className="input-field min-h-[140px] resize-y"
                placeholder="Tell us more..."
                required
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <span className="mt-1 block text-right text-xs text-muted">{message.length}/1,000</span>
            </label>
          </div>

          <button type="submit" disabled={sending} className="btn-primary mt-6 w-full">
            Send message <IconChevronRight className="h-4 w-4" />
          </button>
          <p className="mt-4 text-xs text-muted">
            We&apos;ll only use your details to reply to your message.{' '}
            <Link to="/privacy" className="underline hover:text-text">
              Read our Privacy Policy
            </Link>
            .
          </p>
        </form>

        <div className="space-y-4">
          {INFO_CARDS.map((card) => (
            <div
              key={card.title}
              className="flex overflow-hidden rounded-[12px] border border-border bg-[#111]"
            >
              <div className="flex flex-1 flex-col justify-center p-5">
                <h3 className="font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm text-muted">{card.text}</p>
                {card.external ? (
                  <a href={card.to} className="mt-3 text-sm font-medium text-accent hover:underline">
                    {card.linkLabel}
                  </a>
                ) : (
                  <Link to={card.to} className="mt-3 text-sm font-medium text-accent hover:underline">
                    {card.linkLabel}
                  </Link>
                )}
              </div>
              <div className="hidden w-28 shrink-0 bg-[#151515] sm:block sm:w-32">
                <img src={card.image} alt="" className="h-full w-full object-contain p-3" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 flex flex-col gap-4 border-y border-border py-6 sm:flex-row sm:items-center sm:gap-8">
        <p className="eyebrow shrink-0">Useful links</p>
        <div className="flex flex-wrap items-center gap-4 sm:gap-8">
          <Link to="/shipping-returns" className="inline-flex items-center gap-2 text-sm hover:text-accent">
            <IconPackage className="h-4 w-4" />
            Shipping & returns →
          </Link>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <Link to="/help" className="inline-flex items-center gap-2 text-sm hover:text-accent">
            <IconDocument className="h-4 w-4" />
            Frequently asked questions →
          </Link>
        </div>
      </div>
    </div>
  );
}
