import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Product } from '../../types';

type Props = {
  product: Product;
  className?: string;
  large?: boolean;
};

export function ProductCard({ product, className = '', large }: Props) {
  const image = product.images?.[0];
  const rating = product.avgRating ?? 0;
  const reviews = product.reviewCount ?? 0;

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`group glass overflow-hidden rounded-2xl ${className}`}
    >
      <Link to={`/product/${product._id}`} className="block">
        <div className={`relative overflow-hidden bg-surface-2 ${large ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
          {image ? (
            <img
              src={image}
              alt={product.name}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">No image</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-void/80 via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className={`font-display font-semibold text-text ${large ? 'text-2xl' : 'text-lg'}`}>
              {product.name}
            </h3>
            <div className="mt-1 flex items-center justify-between text-sm">
              <span className="font-medium text-accent">${product.basePrice.toFixed(2)}</span>
              <span className="text-muted">
                {reviews > 0 ? `★ ${rating.toFixed(1)} (${reviews})` : 'New'}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
