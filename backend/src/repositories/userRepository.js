import { User } from '../models/User.js';

export const userRepository = {
  async create(data) {
    return User.create(data);
  },
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase(), isDeleted: false });
  },
  async findById(id) {
    return User.findOne({ _id: id, isDeleted: false });
  },
  async findByGoogleId(googleId) {
    return User.findOne({ googleId, isDeleted: false });
  },
  async linkGoogle(id, googleId) {
    return User.findByIdAndUpdate(id, { googleId }, { new: true });
  },
  async updateRefreshToken(id, refreshTokenHash) {
    return User.findByIdAndUpdate(id, { refreshTokenHash }, { new: true });
  },
  async listCustomers({ filter, skip, limit }) {
    const [items, total] = await Promise.all([
      User.find(filter)
        .select('name email role isDeleted createdAt updatedAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);
    return { items, total };
  },
  async pushNotification(userId, notification) {
    return User.findByIdAndUpdate(
      userId,
      {
        $push: {
          notifications: {
            $each: [notification],
            $position: 0,
            $slice: 50,
          },
        },
      },
      { new: true }
    );
  },
};
