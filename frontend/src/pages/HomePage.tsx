import { Link } from 'react-router-dom';
import { IconChevronRight } from '../components/icons/Icons';

export function HomePage() {
  return (
    <section className="relative min-h-[calc(100vh-72px)] overflow-hidden bg-black">
      <img
        src="/images/shop/artwork/hero-still-life.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-[70%_center] md:object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent md:via-black/55" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-72px)] max-w-[1600px] flex-col justify-center px-6 py-16 lg:px-10">
        <p className="wordmark text-[clamp(2.5rem,8vw,5.5rem)] tracking-[0.28em]">SHOP</p>
        <h1 className="mt-6 max-w-md text-2xl font-semibold leading-snug text-text md:text-3xl lg:text-4xl">
          Find <span className="text-accent">YOUR</span> next favorite.
        </h1>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted md:text-base">
          Curated tech, fashion, and home — built for the way you actually shop.
        </p>
        <div className="mt-8">
          <Link to="/browse" className="btn-primary px-7 py-3.5 text-base">
            Shop now <IconChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
