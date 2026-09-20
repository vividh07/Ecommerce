import { Link } from 'react-router-dom';

const SOCIAL = [
  {
    label: 'Instagram',
    href: '#',
    path: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.5 1 .4.4.7.9 1 1.5.2.4.4 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-1 1.5-.4.4-.9.7-1.5 1-.4.2-1.1.4-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.5-1-.4-.4-.7-.9-1-1.5-.2-.4-.4-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 1-1.5.4-.4.9-.7 1.5-1 .4-.2 1.1-.4 2.3-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.2 0-3.5 0-4.8.1-1 .1-1.6.2-1.9.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.3-.3.9-.3 1.9-.1 1.2-.1 1.6-.1 4.8s0 3.5.1 4.8c.1 1 .2 1.6.3 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.3.1.9.3 1.9.3 1.2.1 1.6.1 4.8.1s3.5 0 4.8-.1c1-.1 1.6-.2 1.9-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.3.3-.9.3-1.9.1-1.2.1-1.6.1-4.8s0-3.5-.1-4.8c-.1-1-.2-1.6-.3-1.9-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.3-.1-.9-.3-1.9-.3-1.3-.1-1.6-.1-4.8-.1zm0 3.1a4.9 4.9 0 110 9.8 4.9 4.9 0 010-9.8zm0 1.8a3.1 3.1 0 100 6.2 3.1 3.1 0 000-6.2zm6.4-2a1.2 1.2 0 11-2.3 0 1.2 1.2 0 012.3 0z',
  },
  {
    label: 'YouTube',
    href: '#',
    path: 'M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31.5 31.5 0 000 12a31.5 31.5 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31.5 31.5 0 0024 12a31.5 31.5 0 00-.5-5.8zM9.8 15.5v-7l6.3 3.5-6.3 3.5z',
  },
  {
    label: 'Pinterest',
    href: '#',
    path: 'M12 2C6.5 2 2 6.5 2 12c0 4.2 2.6 7.8 6.3 9.2-.1-.8-.2-2 0-2.9.2-.8 1.3-5.4 1.3-5.4s-.3-.7-.3-1.6c0-1.5.9-2.6 2-2.6.9 0 1.4.7 1.4 1.5 0 .9-.6 2.3-.9 3.5-.3 1.1.5 1.9 1.6 1.9 1.9 0 3.2-2.4 3.2-5.3 0-2.2-1.5-3.8-4.2-3.8-3.1 0-5 2.3-5 4.8 0 .9.3 1.5.7 2 .1.1.1.2.1.3l-.3 1c0 .1-.1.2-.3.1-1.3-.6-2-1.9-2-3.5C5.3 8 7.8 5 11.6 5c3.1 0 5.2 2.3 5.2 4.7 0 3.2-1.8 5.6-4.1 5.6-.8 0-1.6-.4-1.9-1l-.5 2c-.2.7-.7 1.5-1 2C10.3 21.8 11.1 22 12 22c5.5 0 10-4.5 10-10S17.5 2 12 2z',
  },
  {
    label: 'Spotify',
    href: '#',
    path: 'M12 2a10 10 0 100 20 10 10 0 000-20zm4.6 14.4a.6.6 0 01-.9.2c-2.3-1.4-5.3-1.7-8.8-.9a.6.6 0 11-.4-1.2c3.8-.8 7.2-.5 9.8 1.1a.6.6 0 01.3.8zm1.2-2.7a.8.8 0 01-1.1.3c-2.7-1.6-6.8-2.1-9.9-1.1a.8.8 0 01-.5-1.5c3.6-1.1 8.1-.6 11.2 1.3a.8.8 0 01.3 1zm.1-2.8c-3.2-1.9-8.5-2.1-11.5-1.1a1 1 0 11-.6-1.8c3.5-1.1 9.4-.9 13.1 1.3a1 1 0 01-1 1.6z',
  },
];

const SHOP_LINKS = [
  { label: 'All products', to: '/browse' },
  { label: 'Tech', to: '/browse?category=tech' },
  { label: 'Home', to: '/browse?category=home' },
  { label: 'Fashion', to: '/browse?category=fashion' },
  { label: 'Beauty', to: '/browse?category=beauty' },
];

const SUPPORT_LINKS = [
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/help' },
  { label: 'Shipping & returns', to: '/shipping-returns' },
  { label: 'Track order', to: '/shipping-returns#track' },
];

const COMPANY_LINKS = [
  { label: 'About', to: '/about' },
  { label: 'Privacy', to: '/privacy' },
  { label: 'Terms', to: '/terms' },
];

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <p className="text-sm font-semibold text-text">{title}</p>
      <ul className="mt-4 space-y-2.5">
        {links.map((link) => (
          <li key={link.to + link.label}>
            <Link to={link.to} className="text-sm text-muted transition hover:text-text">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-black">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_repeat(3,1fr)] lg:gap-12">
          <div>
            <Link to="/" className="wordmark text-xl tracking-[0.42em]">
              SHOP
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              Thoughtful finds. Everyday favourites.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="rounded-full p-2 text-muted transition hover:bg-white/5 hover:text-text"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <FooterCol title="Shop" links={SHOP_LINKS} />
          <FooterCol title="Support" links={SUPPORT_LINKS} />
          <FooterCol title="Company" links={COMPANY_LINKS} />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} SHOP. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            India (INR)
            <span className="text-xs">∨</span>
          </p>
          <p className="sm:text-right">Good things go further.</p>
        </div>
      </div>
    </footer>
  );
}
