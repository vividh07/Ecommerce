import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Seller } from '../models/Seller.js';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { Coupon } from '../models/Coupon.js';
import { DEMO_PASSWORD, buildDemoCatalog } from './demoCatalog.js';

dotenv.config();

async function connect() {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mv-ecommerce';
  if (process.env.USE_IN_MEMORY_MONGO === 'true') {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const mem = await MongoMemoryServer.create();
    uri = mem.getUri();
    global.__seedMemoryServer = mem;
  }
  await mongoose.connect(uri);
}

async function seed() {
  await connect();
  await Promise.all([
    User.deleteMany({}),
    Seller.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    ProductVariant.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const [admin, sellerUser] = await User.create([
    { name: 'Admin User', email: 'admin@demo.shop', passwordHash, role: 'ADMIN' },
    { name: 'Nova Gear', email: 'seller@demo.shop', passwordHash, role: 'SELLER' },
    { name: 'Alex Customer', email: 'customer@demo.shop', passwordHash, role: 'CUSTOMER' },
  ]);

  void admin;

  const seller = await Seller.create({
    userId: sellerUser._id,
    storeName: 'SHOP Studio',
    description: 'Curated everyday essentials.',
    isApproved: true,
  });

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

  console.log('Seed complete');
  console.log(`Admin: admin@demo.shop / ${DEMO_PASSWORD}`);
  console.log(`Seller: seller@demo.shop / ${DEMO_PASSWORD}`);
  console.log(`Customer: customer@demo.shop / ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
  if (global.__seedMemoryServer) {
    await global.__seedMemoryServer.stop();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
