import { Link } from 'react-router-dom';

const SOCIAL = [
  {
    label: 'Instagram',
    href: '#',
    path: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.5 1 .4.4.7.9 1 1.5.2.4.4 1.1.4 2.3.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-1 1.5-.4.4-.9.7-1.5 1-.4.2-1.1.4-2.3.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.5-1-.4-.4-.7-.9-1-1.5-.2-.4-.4-1.1-.4-2.3C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.9.4-2.3.2-.6.5-1 1-1.5.4-.4.9-.7 1.5-1 .4-.2 1.1-.4 2.3-.4C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.2 0-3.5 0-4.8.1-1 .1-1.6.2-1.9.3-.5.2-.8.4-1.1.7-.3.3-.5.6-.7 1.1-.1.3-.3.9-.3 1.9-.1 1.2-.1 1.6-.1 4.8s0 3.5.1 4.8c.1 1 .2 1.6.3 1.9.2.5.4.8.7 1.1.3.3.6.5 1.1.7.3.1.9.3 1.9.3 1.2.1 1.6.1 4.8.1s3.5 0 4.8-.1c1-.1 1.6-.2 1.9-.3.5-.2.8-.4 1.1-.7.3-.3.5-.6.7-1.1.1-.3.3-.9.3-1.9.1-1.2.1-1.6.1-4.8s0-3.5-.1-4.8c-.1-1-.2-1.6-.3-1.9-.2-.5-.4-.8-.7-1.1-.3-.3-.6-.5-1.1-.7-.3-.1-.9-.3-1.9-.3-1.3-.1-1.6-.1-4.8-.1zm0 3.1a4.9 4.9 0 110 9.8 4.9 4.9 0 010-9.8zm0 1.8a3.1 3.1 0 100 6.2 3.1 3.1 0 000-6.2zm6.4-2a1.2 1.2 0 11-2.3 0 1.2 1.2 0 012.3 0z',
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/vividh-choudhary/',
    path: 'M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 110-4.13 2.06 2.06 0 010 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.23 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.21 0 22.23 0z',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/vividh07',
    path: 'M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.5-1.4-1.3-1.8-1.3-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3z',
  },
  {
    label: 'Spotify',
    href: 'https://open.spotify.com/user/ykgm4sa32ju4pvcy1jyd86va4',
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
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_repeat(3,1fr)] lg:gap-12">
          <div>
            <Link to="/" className="wordmark text-xl tracking-[0.42em]">
              LUMEN
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
                  target={s.href.startsWith('http') ? '_blank' : undefined}
                  rel={s.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                  className="rounded-full p-2 text-muted transition hover:bg-hover-soft hover:text-text"
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
          <p>© {year} LUMEN. All rights reserved.</p>
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
