import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../components/layout/ShopNavbar';

export function PrivacyPage() {
  return (
    <div className="max-w-2xl pb-8">
      <Breadcrumbs items={[{ label: 'HOME', to: '/' }, { label: 'PRIVACY' }]} />
      <h1 className="page-title mt-8 text-4xl md:text-5xl">Privacy</h1>
      <p className="mt-6 text-sm leading-relaxed text-muted md:text-base">
        SHOP collects account, order and support details so we can fulfil purchases, provide customer
        service and send updates you opt into. We do not sell personal information. Contact{' '}
        <a href="mailto:support@example.com" className="text-accent hover:underline">
          support@example.com
        </a>{' '}
        with privacy questions. Full policy text will reflect your store&apos;s actual practices.
      </p>
      <Link to="/contact" className="mt-8 inline-block text-sm text-accent hover:underline">
        Contact us →
      </Link>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="max-w-2xl pb-8">
      <Breadcrumbs items={[{ label: 'HOME', to: '/' }, { label: 'TERMS' }]} />
      <h1 className="page-title mt-8 text-4xl md:text-5xl">Terms</h1>
      <p className="mt-6 text-sm leading-relaxed text-muted md:text-base">
        By using SHOP you agree to browse and purchase products subject to availability, pricing in
        INR, and our shipping and returns policies. Account holders are responsible for keeping login
        details secure. This stub summarises intent only — replace with counsel-reviewed terms before
        launch.
      </p>
      <Link to="/shipping-returns" className="mt-8 inline-block text-sm text-accent hover:underline">
        Shipping & returns →
      </Link>
    </div>
  );
}
