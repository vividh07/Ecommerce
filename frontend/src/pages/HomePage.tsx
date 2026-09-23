import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../lib/api';
import { formatINR } from '../lib/money';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  IconChevronRight,
  IconHeadset,
  IconHeart,
  IconLock,
  IconPackage,
} from '../components/icons/Icons';
import type { Category, Product, ProductVariant } from '../types';

const CATEGORIES = [
  {
    name: 'Tech',
    blurb: 'Smart tools for brighter days.',
    to: '/browse?category=tech',
    image: '/images/shop/products/keyboard-charcoal.png',
  },
  {
    name: 'Home',
    blurb: 'Objects for a calmer life.',
    to: '/browse?category=home',
    image: '/images/shop/products/lamp-orange.png',
  },
  {
    name: 'Fashion',
    blurb: 'Everyday style, elevated.',
    to: '/browse?category=fashion',
    image: '/images/shop/products/sneakers-running.png',
  },
  {
    name: 'Beauty',
    blurb: 'Care that goes further.',
    to: '/browse?category=beauty',
    image: '/images/shop/products/cleanser-amber.png',
  },
];

const VALUE_ITEMS = [
  {
    icon: IconPackage,
    title: 'Easy returns',
    text: 'Not quite right? Send it back with ease.',
  },
  {
    icon: IconLock,
    title: 'Secure checkout',
    text: 'Your information stays safe with us.',
  },
  {
    icon: IconHeadset,
    title: 'Support when you need it',
    text: 'Real people, real help.',
  },
];

function VerticalLabel({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 md:right-8 lg:block">
      <p className="origin-center rotate-90 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.35em] text-white/50">
        {text}
      </p>
      <span className="mx-auto mt-3 block h-8 w-px bg-white/30" />
    </div>
  );
}

function HomeProductCard({
  product,
  categoryLabel,
  onAdd,
  onWishlist,
  wishlisted,
}: {
  product: Product;
  categoryLabel: string;
  onAdd: () => void;
  onWishlist: () => void;
  wishlisted: boolean;
}) {
  const image = product.images?.[0];
  return (
    <article className="group flex flex-col overflow-hidden rounded-[12px] border border-border bg-panel">
      <div className="relative aspect-square bg-tile">
        <Link to={`/product/${product._id}`} className="block h-full w-full">
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-contain p-4 transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <span className="flex h-full items-center justify-center text-muted">No image</span>
          )}
        </Link>
        <button
          type="button"
          onClick={onWishlist}
          className="absolute right-3 top-3 rounded-full p-2 text-text transition hover:text-accent"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <IconHeart className="h-4 w-4" filled={wishlisted} />
        </button>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="eyebrow text-[10px]">{categoryLabel}</p>
        <Link to={`/product/${product._id}`} className="mt-1.5 font-semibold leading-snug line-clamp-2 hover:text-accent">
          {product.name}
        </Link>
        <p className="mt-2 text-sm font-semibold">{formatINR(product.basePrice)}</p>
        <button type="button" onClick={onAdd} className="btn-primary mt-4 w-full">
          Add to bag
        </button>
      </div>
    </article>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [email, setEmail] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    api.get('/catalog/categories').then((res) => setCategories(res.data.data ?? []));
    api.get('/catalog/products', { params: { limit: 12, sort: 'newest' } }).then((res) => {
      setProducts(res.data.items ?? []);
    });
  }, []);

  const categoryMap = new Map(categories.map((c) => [c._id, c.name]));
  const favourites = products.slice(0, 4);
  const discoveries = products.slice(4, 7);

  async function requireAuth(): Promise<boolean> {
    if (user) return true;
    toast.error('Sign in to continue');
    navigate('/login');
    return false;
  }

  async function handleAdd(productId: string) {
    if (!(await requireAuth())) return;
    try {
      const res = await api.get(`/catalog/products/${productId}`);
      const variants: ProductVariant[] = res.data.data?.variants ?? [];
      const variant = variants.find((v) => v.stock > 0) ?? variants[0];
      if (!variant) {
        toast.error('This product is unavailable');
        return;
      }
      await addItem(variant._id, 1);
    } catch {
      toast.error('Could not add to bag');
    }
  }

  async function handleWishlist(productId: string) {
    if (!(await requireAuth())) return;
    try {
      await toggle(productId);
    } catch {
      toast.error('Could not update wishlist');
    }
  }

  async function subscribe(e: FormEvent) {
    e.preventDefault();
    if (!agreed) {
      toast.error('Please agree to receive emails');
      return;
    }
    setSubscribing(true);
    try {
      await api.post('/site/newsletter', { email, source: 'home' });
      toast.success('You are subscribed');
      setEmail('');
      setAgreed(false);
    } catch {
      toast.error('Could not subscribe');
    } finally {
      setSubscribing(false);
    }
  }

  return (
    <div className="bg-bg text-text">
      {/* Hero */}
      <section className="relative min-h-[calc(100vh-120px)] overflow-hidden md:min-h-[calc(100vh-110px)]">
        <img
          src="/images/shop/artwork/hero-still-life.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-[70%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-transparent md:via-black/50" />
        <VerticalLabel text="GOOD THINGS GO FURTHER" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100vh-120px)] max-w-[1600px] flex-col justify-center px-4 py-16 sm:px-6 lg:px-10 md:min-h-[calc(100vh-110px)]">
          <h1 className="page-title max-w-xl text-[clamp(2.75rem,8vw,5.5rem)] !text-white">
            Good things.
            <br />
            Every day.
          </h1>
          <p className="mt-5 max-w-md text-base text-white/80 md:text-lg">
            Discover considered essentials for the way you live.
          </p>
          <div className="mt-8">
            <Link to="/browse" className="btn-primary px-6 py-3.5 text-base">
              Shop the collection <IconChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-8 text-xs font-medium uppercase tracking-[0.28em] text-white/70">
            Tech · Home · Fashion · Beauty
          </p>
        </div>
      </section>

      {/* Value bar */}
      <section className="border-y border-border bg-panel">
        <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-10">
          {VALUE_ITEMS.map((item) => (
            <div key={item.title} className="flex gap-4">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="mt-1 text-sm text-muted">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold md:text-3xl">Shop by category</h2>
          <Link to="/browse" className="shrink-0 text-sm text-muted transition hover:text-accent">
            Explore all →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={cat.to}
              className="group relative flex flex-col overflow-hidden rounded-[12px] border border-border bg-panel transition hover:border-border-strong"
            >
              <div className="aspect-[4/3] bg-tile p-6">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
              <div className="flex items-end justify-between gap-3 p-5 pt-3">
                <div>
                  <p className="text-lg font-semibold">{cat.name}</p>
                  <p className="mt-1 text-sm text-muted">{cat.blurb}</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-text transition group-hover:border-accent group-hover:bg-accent group-hover:text-accent-fg">
                  <IconChevronRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Everyday favourites */}
      <section className="mx-auto max-w-[1600px] px-4 pb-16 sm:px-6 lg:px-10 lg:pb-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold md:text-3xl">Everyday favourites</h2>
          <Link to="/browse" className="shrink-0 text-sm text-muted transition hover:text-accent">
            View all products →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {favourites.map((p) => (
            <HomeProductCard
              key={p._id}
              product={p}
              categoryLabel={(categoryMap.get(p.categoryId) ?? 'Catalog').toUpperCase()}
              onAdd={() => handleAdd(p._id)}
              onWishlist={() => handleWishlist(p._id)}
              wishlisted={isWishlisted(p._id)}
            />
          ))}
        </div>
      </section>

      {/* Lifestyle CTA */}
      <section className="relative overflow-hidden">
        <img
          src="/images/shop/products/lamp-orange.png"
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-center opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(232,93,4,0.15),transparent_55%)]" />
        <VerticalLabel text="A CALMER HAPPIER YOU" />
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <h2 className="page-title max-w-lg text-[clamp(2.5rem,6vw,4.5rem)] !text-white">Make room for better.</h2>
          <p className="mt-5 max-w-md text-base text-white/75">
            Everyday objects, made extraordinary. Thoughtful design for a more intentional home.
          </p>
          <Link to="/browse?category=home" className="btn-primary mt-8 inline-flex px-6 py-3.5">
            Explore home <IconChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* New discoveries */}
      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-semibold md:text-3xl">New discoveries</h2>
          <Link to="/browse?sort=newest" className="shrink-0 text-sm text-muted transition hover:text-accent">
            View all products →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {discoveries.map((p) => (
            <HomeProductCard
              key={p._id}
              product={p}
              categoryLabel={(categoryMap.get(p.categoryId) ?? 'Catalog').toUpperCase()}
              onAdd={() => handleAdd(p._id)}
              onWishlist={() => handleWishlist(p._id)}
              wishlisted={isWishlisted(p._id)}
            />
          ))}
        </div>
      </section>

      {/* Brand statement */}
      <section className="relative overflow-hidden border-y border-border">
        <img
          src="/images/shop/artwork/hero-still-life.png"
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover object-[center_80%] opacity-30 blur-[1px]"
        />
        <div className="absolute inset-0 bg-black/70" />
        <VerticalLabel text="BETTER OBJECTS BRIGHTER DAYS" />
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-24 text-center sm:px-6 lg:px-10 lg:py-28">
          <h2 className="page-title mx-auto max-w-3xl text-[clamp(2.25rem,5vw,4rem)] !text-white">
            Less noise. More good finds.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base text-white/75">
            We curate thoughtful essentials for a more inspired everyday life. Less clutter, more of what
            matters.
          </p>
          <Link to="/about" className="btn-primary mt-8 inline-flex px-6 py-3.5">
            About LUMEN <IconChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2 className="page-title text-[clamp(2rem,4vw,3.25rem)]">A little good in your inbox.</h2>
          <p className="mt-4 text-sm text-muted md:text-base">
            New arrivals, stories and thoughtful recommendations. No spam, just good things.
          </p>
          <form onSubmit={subscribe} className="mt-8 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="input-field flex-1"
              />
              <button type="submit" disabled={subscribing} className="btn-primary shrink-0 px-6">
                Subscribe
              </button>
            </div>
            <label className="flex items-start gap-3 text-left text-xs text-muted sm:justify-center sm:text-center">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 accent-accent"
              />
              <span>I agree to receive emails from LUMEN. You can unsubscribe at any time.</span>
            </label>
          </form>
        </div>
      </section>
    </div>
  );
}
