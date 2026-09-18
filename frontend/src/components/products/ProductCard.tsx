import { Link } from 'react-router-dom';
import { IconHeart } from '../icons/Icons';
import type { Product } from '../../types';

type Props = {
  product: Product;
  categoryLabel?: string;
  onWishlistToggle?: () => void;
  wishlisted?: boolean;
};

export function ProductCard({ product, categoryLabel = 'CATALOG', onWishlistToggle, wishlisted }: Props) {
  const image = product.images?.[0];
  return (
    <article className="card group overflow-hidden">
      <Link to={`/product/${product._id}`} className="relative block aspect-[4/5] bg-surface-2">
        {image ? (
          <img src={image} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-muted">No image</div>
        )}
        {onWishlistToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onWishlistToggle();
            }}
            className="absolute right-3 top-3 rounded-full border border-border bg-bg/80 p-2 text-text"
          >
            <IconHeart className="h-4 w-4" filled={wishlisted} />
          </button>
        )}
      </Link>
      <div className="border-t border-border p-4">
        <p className="eyebrow text-[10px]">{categoryLabel}</p>
        <h3 className="mt-1 font-semibold leading-snug">{product.name}</h3>
        <p className="mt-2 text-sm font-medium">${product.basePrice.toFixed(2)}</p>
      </div>
    </article>
  );
}
