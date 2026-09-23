import mongoose from 'mongoose';

/**
 * Run work inside a Mongo transaction when the server supports it
 * (replica set / mongos). Falls back to plain writes for standalone /
 * basic in-memory Mongo.
 */
export async function withTransaction(work) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (err) {
    const unsupported =
      err?.code === 20 ||
      err?.codeName === 'IllegalOperation' ||
      /Transaction numbers are only allowed|replica set/i.test(err?.message || '');
    if (unsupported) {
      return work(null);
    }
    throw err;
  } finally {
    session.endSession();
  }
}
