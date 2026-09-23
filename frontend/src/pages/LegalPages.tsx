import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import {
  IconBag,
  IconChart,
  IconChevronRight,
  IconDownload,
  IconLock,
  IconUser,
  IconWarning,
} from '../components/icons/Icons';

type TocItem = { id: string; label: string };

function LegalShell({
  crumbs,
  title,
  subtitle,
  toc,
  aside,
  meta,
  children,
}: {
  crumbs: { label: string; to?: string }[];
  title: string;
  subtitle: string;
  toc: TocItem[];
  aside?: ReactNode;
  meta?: ReactNode;
  children: ReactNode;
}) {
  const [active, setActive] = useState(toc[0]?.id ?? '');

  useEffect(() => {
    const nodes = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!nodes.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.15, 0.4] }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [toc]);

  return (
    <div className="pb-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Breadcrumbs items={crumbs} />
        {meta}
      </div>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="page-title text-[clamp(2.4rem,5vw,3.75rem)]">{title}</h1>
          <p className="mt-4 max-w-xl text-base text-muted">{subtitle}</p>
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-16">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">On this page</p>
          <nav className="mt-4 space-y-0.5">
            {toc.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActive(item.id)}
                className={`block rounded-[8px] px-3 py-2 text-sm transition ${
                  active === item.id
                    ? 'bg-accent text-accent-fg'
                    : 'text-muted hover:bg-hover-soft hover:text-text'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
          {aside}
        </aside>
        <div className="min-w-0 space-y-10">{children}</div>
      </div>
    </div>
  );
}

function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-border pt-8 first:border-t-0 first:pt-0">
      <h2 className="flex gap-4 text-xl font-semibold md:text-2xl">
        <span className="shrink-0 text-muted">{index}</span>
        <span>{title}</span>
      </h2>
      <div className="mt-3 max-w-2xl space-y-3 pl-0 text-sm leading-relaxed text-muted md:pl-12 md:text-base">
        {children}
      </div>
    </section>
  );
}

function downloadText(filename: string, body: string) {
  const blob = new Blob([body], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const PRIVACY_TOC: TocItem[] = [
  { id: 'overview', label: '01  Overview' },
  { id: 'collect', label: '02  Information we collect' },
  { id: 'use', label: '03  How we use information' },
  { id: 'sharing', label: '04  Sharing' },
  { id: 'cookies', label: '05  Cookies' },
  { id: 'choices', label: '06  Your choices' },
  { id: 'contact', label: '07  Contact' },
];

export function PrivacyPage() {
  return (
    <LegalShell
      crumbs={[
        { label: 'HOME', to: '/' },
        { label: 'LEGAL', to: '/privacy' },
        { label: 'PRIVACY' },
      ]}
      title="Your privacy matters."
      subtitle="Understand what information is collected and how it is used."
      toc={PRIVACY_TOC}
      meta={
        <div className="text-right">
          <IconLock className="ml-auto h-8 w-8 text-accent" />
          <p className="mt-3 text-xs text-muted">Updated April 24, 2025</p>
          <p className="mt-1 text-xs text-muted">Sample policy layout</p>
        </div>
      }
      aside={
        <button
          type="button"
          className="mt-8 flex items-center gap-2 text-sm text-muted transition hover:text-text"
          onClick={() =>
            downloadText(
              'lumen-privacy.txt',
              'LUMEN Privacy Policy\n\nThis is a portfolio demo policy. Contact support@lumen.shop with questions.\n'
            )
          }
        >
          <IconDownload className="h-4 w-4" />
          Download policy
          <span className="text-xs">PDF · 124 KB</span>
        </button>
      }
    >
      <Section id="overview" index="01" title="Overview">
        <p>
          This page explains how LUMEN handles account, order and support information on this demo
          store. It is written for a portfolio walkthrough — not as legal advice.
        </p>
      </Section>

      <Section id="collect" index="02" title="Information we collect">
        <p>
          Account details, delivery addresses, order history, and information you choose to share
          (such as contact messages or newsletter sign-up).
        </p>
      </Section>

      <Section id="use" index="03" title="How information is used">
        <p>We use information for the following purposes:</p>
        <div className="grid gap-3 pt-2 sm:grid-cols-3">
          {[
            { icon: IconBag, title: 'Process orders', text: 'Use details to pack, fulfil and track orders.' },
            { icon: IconUser, title: 'Support your account', text: 'Help with account, delivery and order questions.' },
            { icon: IconChart, title: 'Improve the experience', text: 'Understand how the store is used and make it clearer.' },
          ].map((card) => (
            <div key={card.title} className="rounded-[12px] border border-border bg-panel p-4">
              <card.icon className="h-5 w-5 text-muted" />
              <p className="mt-3 text-sm font-semibold text-text">{card.title}</p>
              <p className="mt-1 text-xs leading-relaxed">{card.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="sharing" index="04" title="Sharing">
        <p>
          Payment, delivery and hosting providers may receive the details they need to run checkout
          and ship orders. We do not sell personal information.
        </p>
      </Section>

      <Section id="cookies" index="05" title="Cookies">
        <p>Essential cookies keep you signed in. Optional analytics or marketing cookies can be limited.</p>
        <button
          type="button"
          className="btn-outline mt-2 rounded-full px-4 py-2 text-sm"
          onClick={() => toast('Cookie preferences are a demo control.')}
        >
          Manage cookie preferences
        </button>
      </Section>

      <Section id="choices" index="06" title="Your choices">
        <p>
          You can access, correct or delete account details from settings, or ask us to help. Order
          records may be kept as needed to fulfil returns and support.
        </p>
      </Section>

      <Section id="contact" index="07" title="Contact">
        <p>
          Questions about this policy:{' '}
          <a href="mailto:support@lumen.shop" className="text-text underline underline-offset-4">
            support@lumen.shop
          </a>
        </p>
      </Section>
    </LegalShell>
  );
}

const TERMS_TOC: TocItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'accounts', label: 'Accounts' },
  { id: 'pricing', label: 'Products & pricing' },
  { id: 'orders', label: 'Orders & payments' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'returns', label: 'Returns' },
  { id: 'sellers', label: 'Marketplace sellers' },
  { id: 'contact', label: 'Contact' },
];

export function TermsPage() {
  return (
    <LegalShell
      crumbs={[
        { label: 'HOME', to: '/' },
        { label: 'LEGAL', to: '/terms' },
        { label: 'TERMS' },
      ]}
      title="Clearer terms. Better shopping."
      subtitle="Guidelines for using LUMEN and placing an order."
      toc={TERMS_TOC}
      meta={
        <div className="text-right text-xs text-muted">
          <p>Sample policy layout</p>
          <p className="mt-1">Updated April 28, 2025</p>
        </div>
      }
    >
      <Section id="overview" index="1." title="Using LUMEN">
        <p>
          Describe eligibility and account responsibility. You must be of legal age in your region
          to use LUMEN. You are responsible for keeping account information accurate and for
          activity that happens under your account.
        </p>
      </Section>

      <Section id="accounts" index="2." title="Products & pricing">
        <p>
          Explain availability, currency and applicable charges. Product availability may change
          without notice. Prices are shown in INR and may include or exclude tax or other charges,
          which will be clear at checkout.
        </p>
      </Section>

      <Section id="orders" index="3." title="Orders & payments">
        <p>
          Describe order acceptance, payment processing and cancellation. Placing an order does not
          guarantee acceptance. We may cancel or refuse an order. Payment is processed securely.
          Orders may only be cancelled before they enter fulfilment, subject to our cancellation
          rules.
        </p>
      </Section>

      <Section id="delivery" index="4." title="Delivery">
        <p>
          Set out delivery estimates, shipping charges and how delays are handled. Timeframes and
          fees may vary by location and method. If there is a significant delay, we will update you
          as soon as we can.
        </p>
      </Section>

      <Section id="returns" index="5." title="Returns & refunds">
        <p>
          Returns follow the conditions in our return policy, including eligibility and time limits.
          Refunds are issued to the original payment method after returned items are inspected.
        </p>
        <Link to="/shipping-returns" className="inline-flex items-center gap-1 text-sm text-text underline underline-offset-4">
          View return policy
          <IconChevronRight className="h-3.5 w-3.5" />
        </Link>
      </Section>

      <Section id="sellers" index="6." title="Marketplace sellers">
        <p>
          Some products are sold by independent sellers. Those sellers are responsible for
          fulfilment, product information and customer support for their items.
        </p>
      </Section>

      <Section id="liability" index="7." title="Liability & disputes">
        <p>
          Our liability is limited to the fullest extent permitted by applicable law. Disputes will
          be resolved according to the governing law and jurisdiction for this demo region (India).
        </p>
      </Section>

      <Section id="contact" index="8." title="Contact">
        <p>
          Questions about these terms:{' '}
          <a href="mailto:support@lumen.shop" className="text-text underline underline-offset-4">
            support@lumen.shop
          </a>
        </p>
      </Section>

      <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3 rounded-[12px] border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-text">
          <IconWarning className="mt-0.5 h-4 w-4 shrink-0 text-accent-fg" />
          <p>
            Before checkout: review item details, delivery information and the return policy. This
            helps ensure a smooth shopping experience.
          </p>
        </div>
        <button type="button" className="btn-ghost shrink-0 text-sm" onClick={() => window.print()}>
          Print terms
        </button>
      </div>
    </LegalShell>
  );
}
