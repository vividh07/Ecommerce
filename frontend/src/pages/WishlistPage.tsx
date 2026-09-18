import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { IconHeart } from '../components/icons/Icons';
import { Skeleton } from '../components/ui/Skeleton';

export function WishlistPage() {
  const { products, loading, moveToCart, toggle } = useWishlist();
  const { activeCartId, refresh } = useCart();

  return (
    <div>
      <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'WISHLIST' }]} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Worth saving.</h1>
          <p className="mt-3 text-sm text-muted">Items you love, in one place.</p>
        </div>
        <p className="text-sm text-muted">{products.length} items</p>
      </div>

      {loading ? (
        <Skeleton className="mt-10 h-48 w-full" />
      ) : products.length === 0 ? (
        <p className="mt-12 text-muted">
          <Link to="/browse" className="text-accent underline">
            Browse
          </Link>{' '}
          to save items.
        </p>
      ) : (
        <ul className="mt-10 grid gap-5 lg:grid-cols-2">
          {products.map((p) => (
            <li key={p._id} className="panel flex flex-col overflow-hidden sm:flex-row">
              <Link
                to={`/product/${p._id}`}
                className="aspect-[4/3] shrink-0 bg-panel-2 sm:w-[42%] sm:aspect-auto sm:min-h-[200px]"
              >
                <img src={p.images?.[0]} alt="" className="h-full w-full object-cover" />
              </Link>
              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="eyebrow text-[10px]">Catalog</p>
                    <h2 className="mt-1 text-lg font-semibold leading-snug">{p.name}</h2>
                    <p className="mt-2 text-base font-semibold">${p.basePrice.toFixed(2)}</p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-muted hover:text-danger"
                    onClick={() => toggle(p._id)}
                    aria-label="Remove from wishlist"
                  >
                    <IconHeart className="h-5 w-5" filled />
                  </button>
                </div>
                <button
                  type="button"
                  className="btn-primary mt-auto w-full pt-6 sm:max-w-[200px]"
                  onClick={async () => {
                    try {
                      await moveToCart(p._id, activeCartId ?? undefined);
                      await refresh();
                      toast.success('Added to bag');
                    } catch (err: any) {
                      toast.error(err.response?.data?.message ?? 'Could not add');
                    }
                  }}
                >
                  Add to bag →
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
