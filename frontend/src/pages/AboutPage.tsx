import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import {
  IconChevronRight,
  IconCube,
  IconDocument,
  IconHeadset,
} from '../components/icons/Icons';

const VALUES = [
  {
    icon: IconCube,
    title: 'Thoughtful selection',
    text: 'Every piece earns its place — chosen for design, purpose and everyday use.',
  },
  {
    icon: IconDocument,
    title: 'Clear details',
    text: 'Honest product information so you know exactly what you are getting.',
  },
  {
    icon: IconHeadset,
    title: 'Helpful support',
    text: 'Real people ready to help with orders, delivery and returns.',
  },
];

function VerticalLabel({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute right-4 top-24 z-10 hidden lg:block xl:right-10">
      <p className="origin-top-right rotate-90 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.35em] text-white/45">
        {text}
      </p>
      <span className="mt-3 ml-auto block h-8 w-px bg-white/25" />
    </div>
  );
}

export function AboutPage() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  async function subscribe(e: FormEvent) {
    e.preventDefault();
    setSubscribing(true);
    try {
      await api.post('/site/newsletter', { email, source: 'about' });
      toast.success('You are subscribed');
      setEmail('');
    } catch {
      toast.error('Could not subscribe');
    } finally {
      setSubscribing(false);
    }
  }

  return (
    <div className="bg-black text-text">
      <div className="relative mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-10">
        <Breadcrumbs items={[{ label: 'HOME', to: '/' }, { label: 'ABOUT' }]} />
        <VerticalLabel text="GOOD THINGS GO FURTHER" />

        <div className="mt-8 max-w-3xl pb-10">
          <h1 className="page-title text-[clamp(2.5rem,6vw,4.5rem)]">
            Good finds. With a little more thought.
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/80 md:text-lg">
            SHOP brings everyday essentials together in one considered collection.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[12px] border border-border">
          <img
            src="/images/shop/artwork/hero-still-life.png"
            alt=""
            className="aspect-[21/9] w-full object-cover object-center md:aspect-[2.4/1]"
          />
        </div>
      </div>

      {/* Our story */}
      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:grid lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-24">
        <div>
          <p className="eyebrow">Our story</p>
          <h2 className="page-title mt-4 text-[clamp(2rem,4vw,3.25rem)]">Made for the everyday.</h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted md:text-base">
            <p>
              We started SHOP because finding good everyday things should not feel noisy. Too many
              choices, too little care — we wanted a quieter place to discover products that earn
              their keep.
            </p>
            <p>
              From tech tools to home objects, fashion and beauty, every item is selected for how it
              looks, how it works, and how it fits into real life. Less clutter. More of what
              matters.
            </p>
          </div>
        </div>
        <div className="relative mt-10 overflow-hidden rounded-[12px] border border-border lg:mt-0">
          <img
            src="/images/shop/artwork/auth-still-life.png"
            alt=""
            className="aspect-[4/5] w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 font-display text-2xl uppercase tracking-[0.12em] text-white/90">
            Better Everyday.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-24">
        <p className="eyebrow">Our values</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-[12px] border border-border bg-[#111] p-6">
              <v.icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 text-lg font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mid lifestyle */}
      <section className="relative overflow-hidden">
        <img
          src="/images/shop/artwork/hero-still-life.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative z-10 mx-auto flex min-h-[320px] max-w-[1600px] items-center px-4 py-20 sm:px-6 lg:px-10">
          <p className="max-w-md text-2xl font-semibold leading-snug md:text-3xl">
            Everyday essentials for a brighter tomorrow.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative mx-auto max-w-[1600px] px-4 py-20 text-center sm:px-6 lg:px-10 lg:py-28">
        <VerticalLabel text="GOOD THINGS GO FURTHER" />
        <h2 className="page-title text-[clamp(2.25rem,5vw,3.75rem)]">
          Find <span className="text-accent">your</span> next favourite.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Explore our collection of everyday essentials, chosen with care.
        </p>
        <Link to="/browse" className="btn-primary mt-8 inline-flex rounded-full px-7 py-3.5">
          Explore the collection <IconChevronRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-[1600px] px-4 pb-20 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 rounded-[12px] border border-border p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="page-title text-2xl md:text-3xl">Stay in the loop</h3>
            <p className="mt-2 text-sm text-muted">Get the latest finds, inspiration and offers.</p>
          </div>
          <form onSubmit={subscribe} className="w-full max-w-md space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="input-field flex-1"
              />
              <button type="submit" disabled={subscribing} className="btn-primary shrink-0">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-muted">No spam. Just the good stuff.</p>
          </form>
        </div>
      </section>
    </div>
  );
}
