/** Serve compressed WebP for seeded catalog photos; leave uploads and remote URLs alone. */
export function productImageSrc(src?: string | null) {
  if (!src) return '';
  if (src.startsWith('/images/products/') && /\.png$/i.test(src)) {
    return src.replace(/\.png$/i, '.webp');
  }
  return src;
}
