import { Category } from '../models/Category.js';

export const categoryRepository = {
  async listAll() {
    return Category.find().sort({ name: 1 }).lean();
  },
  async findById(id) {
    return Category.findById(id);
  },
  async create(data) {
    return Category.create(data);
  },
};
