import { createApp } from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';
import { seedIfEmpty } from './scripts/seedData.js';

async function start() {
  await connectDb();
  if (process.env.USE_IN_MEMORY_MONGO === 'true') {
    await seedIfEmpty();
  }
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`API listening on port ${env.PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
