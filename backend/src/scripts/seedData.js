import { seedCatalog } from './seedCatalog.js';
import { DEMO_PASSWORD } from './demoCatalog.js';
import { User } from '../models/User.js';

export async function seedIfEmpty() {
  const count = await User.countDocuments();
  if (count > 0) return false;

  const result = await seedCatalog({ clear: false });
  const sellerLine = result.accounts
    .filter((a) => a.role === 'SELLER')
    .map((a) => a.email)
    .join(', ');
  console.log(
    `Seeded ${result.fromData ? 'Data' : 'demo'} catalog (${result.productCount} products; admin@demo.shop / ${DEMO_PASSWORD}; sellers: ${sellerLine || 'none'}; coupon SAVE10)`
  );
  return true;
}
