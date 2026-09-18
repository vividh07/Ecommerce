import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { AccountSidebar } from '../components/layout/AccountSidebar';
import { Breadcrumbs } from '../components/layout/ShopNavbar';
import { IconHeart } from '../components/icons/Icons';
import { Skeleton } from '../components/ui/Skeleton';

export function WishlistPage() {
  const { products, loading, moveToCart, toggle } = useWishlist();
  const { activeCartId, refresh } = useCart();

  return (
    <div className="grid gap-10 lg:grid-cols-[220px_1fr]">
      <AccountSidebar />
      <div>
        <Breadcrumbs items={[{ label: 'HOME', to: '/browse' }, { label: 'WISHLIST' }]} />
        <div className="mt-4 flex items-end justify-between">
          <div>
            <h1 className="page-title">Worth saving.</h1>
            <p className="mt-2 text-muted">Your wishlist.</p>
          </div>
          <p className="text-sm text-muted">{products.length} items</p>
        </div>
        {loading ? (
          <Skeleton className="mt-8 h-48 w-full" />
        ) : products.length === 0 ? (
          <p className="mt-8 text-muted"><Link to="/browse" className="text-accent underline">Browse</Link> to save items.</p>
        ) : (
          <ul className="mt-8 space-y-4">
            {products.map((p) => (
              <li key={p._id} className="card grid gap-4 overflow-hidden md:grid-cols-[200px_1fr]">
                <Link to={`/product/${p._id}`} className="aspect-square bg-surface-2 md:aspect-auto md:h-full">
                  <img src={p.images?.[0]} alt="" className="h-full w-full object-cover" />
                </Link>
                <div className="flex flex-col p-5">
                  <div className="flex justify-between gap-4">
                    <div>
                      <h2 className="font-semibold text-lg">{p.name}</h2>
                      <p className="text-sm text-muted">Catalog</p>
                      <p className="mt-2 font-medium">${p.basePrice.toFixed(2)}</p>
                    </div>
                    <button type="button" className="text-danger" onClick={() => toggle(p._id)}>
                      <IconHeart className="h-5 w-5" filled />
                      <span className="mt-1 block text-xs underline">Remove</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn-primary mt-6 w-full md:max-w-xs"
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
                    Add to bag
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
