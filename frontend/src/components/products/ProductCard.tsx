import { Link } from 'react-router-dom';
import { IconHeart } from '../icons/Icons';
import { formatINR } from '../../lib/money';
import { productImageSrc } from '../../lib/productImage';
import type { Product } from '../../types';

type Props = {
  product: Product;
  categoryLabel?: string;
  onWishlistToggle?: () => void;
  wishlisted?: boolean;
};

export function ProductCard({ product, categoryLabel = 'CATALOG', onWishlistToggle, wishlisted }: Props) {
  const image = productImageSrc(product.images?.[0]);
  return (
    <article className="product-tile group">
      <Link to={`/product/${product._id}`} className="product-tile-image relative block overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-contain p-3 transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <span className="text-muted">No image</span>
        )}
        {onWishlistToggle && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onWishlistToggle();
            }}
            className="absolute right-3 top-3 rounded-full p-2 text-text transition hover:text-accent"
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <IconHeart className="h-4 w-4" filled={wishlisted} />
          </button>
        )}
      </Link>
      <div className="p-4 pt-3">
        <p className="eyebrow text-[10px]">{categoryLabel}</p>
        <h3 className="mt-1.5 font-semibold leading-snug line-clamp-2">{product.name}</h3>
        <p className="mt-2 text-sm font-semibold">{formatINR(product.basePrice)}</p>
      </div>
    </article>
  );
}
