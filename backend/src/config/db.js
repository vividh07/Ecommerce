import mongoose from 'mongoose';
import { env } from './env.js';

let memoryServer;

export async function connectDb() {
  mongoose.set('strictQuery', true);
  let uri = env.MONGODB_URI;
  if (process.env.USE_IN_MEMORY_MONGO === 'true') {
    // Replica set so checkout transactions (stock + payment) work locally.
    const { MongoMemoryReplSet } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryReplSet.create({
      replSet: { count: 1, storageEngine: 'wiredTiger' },
    });
    uri = memoryServer.getUri();
    console.log('Using in-memory MongoDB (replica set)');
  }
  await mongoose.connect(uri);
}

export async function disconnectDb() {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
  }
}
