import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedCatalog } from './seedCatalog.js';

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
  const result = await seedCatalog({ clear: true });

  console.log('Seed complete');
  console.log(`Source: ${result.fromData ? 'Data/products.json' : 'built-in demoCatalog'}`);
  console.log(`Products: ${result.productCount}`);
  for (const a of result.accounts) {
    const extra = a.storeName ? ` (${a.storeName})` : '';
    console.log(`${a.role}: ${a.email} / ${result.password}${extra}`);
  }
  console.log(`Coupon: SAVE10`);

  await mongoose.disconnect();
  if (global.__seedMemoryServer) {
    await global.__seedMemoryServer.stop();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
