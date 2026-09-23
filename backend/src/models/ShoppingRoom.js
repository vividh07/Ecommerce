import mongoose from 'mongoose';

const ROOM_STATUSES = ['ACTIVE', 'CLOSED'];

const participantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const shortlistSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    addedByUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const voteSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vote: { type: String, enum: ['up', 'down'], required: true },
  },
  { _id: false }
);

const shoppingRoomSchema = new mongoose.Schema(
  {
    hostUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roomCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    participants: { type: [participantSchema], default: [] },
    shortlistedProducts: { type: [shortlistSchema], default: [] },
    votes: { type: [voteSchema], default: [] },
    status: { type: String, enum: ROOM_STATUSES, default: 'ACTIVE' },
  },
  { timestamps: true }
);

shoppingRoomSchema.index({ hostUserId: 1 });

export const ShoppingRoom = mongoose.model('ShoppingRoom', shoppingRoomSchema);
export { ROOM_STATUSES };
