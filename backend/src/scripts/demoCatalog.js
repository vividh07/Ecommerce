/**
 * Shared demo catalogue for seed scripts.
 * Image paths are served by the Vite frontend at /images/shop/...
 */
export const DEMO_PASSWORD = 'Password123!';

export function buildDemoCatalog({ sellerId, categories }) {
  const { tech, fashion, home, beauty, sports } = categories;
  const img = (file) => `/images/shop/products/${file}`;

  const products = [
    {
      sellerId,
      name: 'QuietComfort Ultra',
      subtitle: 'Wireless headphones',
      categoryId: tech._id,
      description:
        'Immersive noise cancellation, spatial audio, and all-day comfort in a refined silver finish.',
      basePrice: 34900,
      images: [
        img('headphones-silver.png'),
        img('headphones-front.png'),
        img('headphones-side.png'),
        img('headphones-folded.png'),
      ],
      isActive: true,
      variants: [
        { attributes: { color: 'Silver' }, price: 34900, stock: 24, sku: 'QC-ULTRA-SILVER' },
        { attributes: { color: 'Charcoal' }, price: 34900, stock: 12, sku: 'QC-ULTRA-CHAR' },
      ],
    },
    {
      sellerId,
      name: 'Trail Runner 530',
      subtitle: 'Everyday running sneakers',
      categoryId: fashion._id,
      description: 'Breathable mesh upper with layered overlays and a cushioned chunky sole.',
      basePrice: 11999,
      images: [img('sneakers-running.png')],
      isActive: true,
      variants: [
        { attributes: { size: '8', color: 'Silver' }, price: 11999, stock: 10, sku: 'TR530-8-SLV' },
        { attributes: { size: '9', color: 'Silver' }, price: 11999, stock: 14, sku: 'TR530-9-SLV' },
        { attributes: { size: '10', color: 'Silver' }, price: 11999, stock: 8, sku: 'TR530-10-SLV' },
      ],
    },
    {
      sellerId,
      name: 'Porta Table Lamp',
      subtitle: 'Mushroom desk lamp',
      categoryId: home._id,
      description: 'Glossy burnt-orange dome with a warm ambient glow for desks and nightstands.',
      basePrice: 8990,
      images: [img('lamp-orange.png')],
      isActive: true,
      variants: [{ attributes: { color: 'Orange' }, price: 8990, stock: 30, sku: 'PORTA-ORG' }],
    },
    {
      sellerId,
      name: 'Venture Sling 6L',
      subtitle: 'Crossbody sling',
      categoryId: fashion._id,
      description: 'Olive woven nylon sling with brass hardware and an adjustable strap.',
      basePrice: 13999,
      images: [img('sling-olive.png')],
      isActive: true,
      variants: [{ attributes: { color: 'Olive' }, price: 13999, stock: 18, sku: 'SLING-6L-OLV' }],
    },
    {
      sellerId,
      name: 'Gentle Facial Cleanser',
      subtitle: 'Daily skincare',
      categoryId: beauty._id,
      description: 'Amber glass pump bottle with a soft cleansing formula for everyday use.',
      basePrice: 3850,
      images: [img('cleanser-amber.png')],
      isActive: true,
      variants: [{ attributes: { size: '200ml' }, price: 3850, stock: 40, sku: 'GFC-200' }],
    },
    {
      sellerId,
      name: 'Compact Mechanical Keyboard',
      subtitle: 'Charcoal with orange accents',
      categoryId: tech._id,
      description: 'Low-profile compact layout with sculpted keys and bright orange accents.',
      basePrice: 11499,
      images: [img('keyboard-charcoal.png')],
      isActive: true,
      variants: [{ attributes: { color: 'Charcoal' }, price: 11499, stock: 22, sku: 'KBD-COMPACT' }],
    },
    {
      sellerId,
      name: 'Court Leather Sneakers',
      subtitle: 'Low-top white leather',
      categoryId: fashion._id,
      description: 'Clean white leather court sneakers with perforated toe boxes.',
      basePrice: 11999,
      images: [img('sneakers-court.png')],
      isActive: true,
      variants: [
        { attributes: { size: '8', color: 'White' }, price: 11999, stock: 9, sku: 'COURT-8-WHT' },
        { attributes: { size: '9', color: 'White' }, price: 11999, stock: 11, sku: 'COURT-9-WHT' },
      ],
    },
    {
      sellerId,
      name: 'The Daily Tote',
      subtitle: 'Olive canvas tote',
      categoryId: fashion._id,
      description: 'Tall olive canvas tote with long shoulder straps for everyday carry.',
      basePrice: 13999,
      images: [img('tote-olive.png')],
      isActive: true,
      variants: [{ attributes: { color: 'Olive' }, price: 13999, stock: 0, sku: 'TOTE-DAILY-OLV' }],
    },
    {
      sellerId,
      name: 'Travel Duffle',
      subtitle: 'Weekend bag',
      categoryId: sports._id,
      description: 'Olive canvas duffle with bronze zipper and removable shoulder strap.',
      basePrice: 15999,
      images: [img('duffle-olive.png')],
      isActive: true,
      variants: [{ attributes: { color: 'Olive' }, price: 15999, stock: 15, sku: 'DUFFLE-OLV' }],
    },
  ];

  return products;
}
