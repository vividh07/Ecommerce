import { Link, useNavigate } from 'react-router-dom';
import { IconChevronRight } from '../components/icons/Icons';

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-[calc(100vh-200px)] flex-col items-center justify-center overflow-hidden bg-bg px-4 py-20 text-center">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[clamp(10rem,40vw,22rem)] leading-none text-transparent"
        style={{ WebkitTextStroke: '1px rgba(255,255,255,0.18)' }}
      >
        404
      </span>

      <div className="relative z-10 flex flex-col items-center">
        <img
          src="/images/shop/products/lamp-orange.png"
          alt=""
          className="mb-8 h-44 w-44 object-contain drop-shadow-[0_0_60px_rgba(232,93,4,0.35)] md:h-56 md:w-56"
        />
        <h1 className="page-title text-[clamp(2rem,5vw,3.5rem)]">
          This one got away<span className="text-accent">.</span>
        </h1>
        <p className="mt-4 text-base text-muted">We couldn&apos;t find the page you&apos;re looking for.</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/browse" className="btn-primary rounded-full px-6">
            Back to shop <IconChevronRight className="h-4 w-4" />
          </Link>
          <button type="button" onClick={() => navigate(-1)} className="btn-outline rounded-full px-6">
            Go back
          </button>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-sm text-muted">
          <Link to="/browse" className="hover:text-text">
            Browse collections
          </Link>
          <span className="text-border">|</span>
          <Link to="/contact" className="hover:text-text">
            Contact us
          </Link>
          <span className="text-border">|</span>
          <Link to="/help" className="hover:text-text">
            Help centre
          </Link>
        </div>
      </div>
    </div>
  );
}
