import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Seller } from '../models/Seller.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { Coupon } from '../models/Coupon.js';
import { DEMO_PASSWORD, buildDemoCatalog } from './demoCatalog.js';
import { hasDataCatalog, loadDataCatalog, sellerDemoEmail } from './loadDataCatalog.js';

/**
 * Seed admin + customer + either Data/products.json catalog (with its sellers)
 * or the built-in demo catalog fallback.
 */
export async function seedCatalog({ clear = false } = {}) {
  if (clear) {
    await Promise.all([
      User.deleteMany({}),
      Seller.deleteMany({}),
      Category.deleteMany({}),
      Product.deleteMany({}),
      ProductVariant.deleteMany({}),
      Coupon.deleteMany({}),
    ]);
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const accounts = [];

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@demo.shop',
    passwordHash,
    role: 'ADMIN',
  });
  accounts.push({ role: 'ADMIN', email: admin.email });

  const customer = await User.create({
    name: 'Alex Customer',
    email: 'customer@demo.shop',
    passwordHash,
    role: 'CUSTOMER',
  });
  accounts.push({ role: 'CUSTOMER', email: customer.email });

  let productCount = 0;

  if (hasDataCatalog()) {
    const data = loadDataCatalog();
    const sellerByJsonId = new Map();

    for (const s of data.sellers ?? []) {
      const email = sellerDemoEmail(s.slug || s.id);
      const sellerUser = await User.create({
        name: s.name,
        email,
        passwordHash,
        role: 'SELLER',
      });
      const seller = await Seller.create({
        userId: sellerUser._id,
        storeName: s.name,
        storeSlug: s.slug || String(s.id).replace(/^seller-/, ''),
        description: `${s.name} — demo seller from Data/products.json.`,
        supportEmail: email,
        isApproved: true,
        onboardingComplete: true,
        onboardingStep: 4,
      });
      sellerByJsonId.set(s.id, seller);
      accounts.push({ role: 'SELLER', email, storeName: s.name });
    }

    const categoryByJsonId = new Map();
    for (const c of data.categories ?? []) {
      const cat = await Category.create({ name: c.name });
      categoryByJsonId.set(c.id, cat);
    }

    for (const p of data.products ?? []) {
      const seller = sellerByJsonId.get(p.sellerId);
      const category = categoryByJsonId.get(p.categoryId);
      if (!seller || !category) {
        console.warn(`Skipping product ${p.id}: missing seller or category`);
        continue;
      }

      const images = [...(p.images ?? [])]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((img) => img.src)
        .filter(Boolean);

      const product = await Product.create({
        sellerId: seller._id,
        name: p.name,
        categoryId: category._id,
        description: p.description || p.shortDescription || '',
        basePrice: p.price,
        images,
        isActive: p.status !== 'inactive',
      });

      const warrantyMonths = p.warranty?.months ?? 12;
      const variants = (p.variants ?? []).map((v) => ({
        productId: product._id,
        attributes: new Map(Object.entries(v.options ?? {})),
        price: v.price ?? p.price,
        stock: v.stockQuantity ?? 0,
        sku: v.sku,
        warrantyMonths,
        replacementEligible: p.returns?.eligible !== false,
      }));

      if (variants.length) {
        await ProductVariant.create(variants);
      }
      productCount += 1;
    }
  } else {
    const sellerUser = await User.create({
      name: 'Nova Gear',
      email: 'seller@demo.shop',
      passwordHash,
      role: 'SELLER',
    });
    const seller = await Seller.create({
      userId: sellerUser._id,
      storeName: 'LUMEN Studio',
      description: 'Curated everyday essentials.',
      isApproved: true,
      onboardingComplete: true,
      onboardingStep: 4,
    });
    accounts.push({ role: 'SELLER', email: sellerUser.email, storeName: 'LUMEN Studio' });

    const [tech, fashion, home, beauty, sports] = await Category.create([
      { name: 'Tech' },
      { name: 'Fashion' },
      { name: 'Home' },
      { name: 'Beauty' },
      { name: 'Sports' },
    ]);

    const catalog = buildDemoCatalog({
      sellerId: seller._id,
      categories: { tech, fashion, home, beauty, sports },
    });

    for (const entry of catalog) {
      const { variants, subtitle, ...productData } = entry;
      void subtitle;
      const product = await Product.create(productData);
      await ProductVariant.create(
        variants.map((v) => ({
          productId: product._id,
          attributes: new Map(Object.entries(v.attributes)),
          price: v.price,
          stock: v.stock,
          sku: v.sku,
        }))
      );
      productCount += 1;
    }
  }

  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);
  await Coupon.create({
    code: 'SAVE10',
    type: 'PERCENTAGE',
    value: 10,
    minOrderValue: 1000,
    expiryDate: expiry,
    usageLimit: 1000,
    isActive: true,
  });

  return { accounts, productCount, password: DEMO_PASSWORD, fromData: hasDataCatalog() };
}
