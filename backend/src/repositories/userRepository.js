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
  async updateRefreshToken(id, refreshTokenHash) {
    return User.findByIdAndUpdate(id, { refreshTokenHash }, { new: true });
  },
};
