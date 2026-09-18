import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { Skeleton } from '../components/ui/Skeleton';

export function WishlistPage() {
  const { products, loading, moveToCart } = useWishlist();
  const { activeCartId, refresh } = useCart();

  async function handleMove(productId: string) {
    try {
      await moveToCart(productId, activeCartId ?? undefined);
      await refresh();
      toast.success('Moved to cart');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Could not move to cart');
    }
  }

  if (loading) return <Skeleton className="h-64 w-full" />;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Wishlist</h1>
      <p className="mt-2 text-muted">Save picks and move them into any named cart.</p>
      {products.length === 0 ? (
        <p className="mt-8 text-muted">
          Nothing saved yet. <Link to="/browse" className="text-accent hover:underline">Browse catalog</Link>
        </p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <motion.article
              key={p._id}
              layout
              className="glass overflow-hidden rounded-2xl"
            >
              <Link to={`/product/${p._id}`}>
                <img
                  src={p.images?.[0]}
                  alt={p.name}
                  className="aspect-[4/3] w-full object-cover"
                />
              </Link>
              <div className="p-4">
                <h2 className="font-display font-semibold">{p.name}</h2>
                <p className="text-accent">${p.basePrice.toFixed(2)}</p>
                <button type="button" className="btn-primary mt-3 w-full text-sm" onClick={() => handleMove(p._id)}>
                  Move to active cart
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}
