import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { ProductVariant } from '../models/ProductVariant.js';
import { Review } from '../models/Review.js';

const catalogBaseFilter = {
  isDeleted: false,
  isActive: true,
};

export const productRepository = {
  async create(data) {
    return Product.create(data);
  },
  async findById(id, { includeDeleted = false } = {}) {
    const filter = includeDeleted ? { _id: id } : { _id: id, isDeleted: false };
    return Product.findOne(filter);
  },
  async update(id, sellerId, data) {
    return Product.findOneAndUpdate({ _id: id, sellerId, isDeleted: false }, data, { new: true });
  },
  async softDelete(id, sellerId) {
    return Product.findOneAndUpdate(
      { _id: id, sellerId, isDeleted: false },
      { isDeleted: true, isActive: false },
      { new: true }
    );
  },
  async adminUpdate(id, data) {
    return Product.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
  },
  async listBySeller(sellerId, { skip, limit }) {
    const filter = { sellerId, isDeleted: false };
    const [items, total] = await Promise.all([
      Product.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);
    return { items, total };
  },
  async countSellerStats(sellerId) {
    const sellerObjectId =
      sellerId instanceof mongoose.Types.ObjectId
        ? sellerId
        : new mongoose.Types.ObjectId(sellerId);

    const [counts] = await Product.aggregate([
      { $match: { sellerId: sellerObjectId, isDeleted: false } },
      {
        $lookup: {
          from: 'productvariants',
          localField: '_id',
          foreignField: 'productId',
          as: 'variants',
        },
      },
      {
        $addFields: {
          totalStock: { $sum: '$variants.stock' },
        },
      },
      {
        $group: {
          _id: null,
          all: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          draft: { $sum: { $cond: ['$isActive', 0, 1] } },
          outOfStock: {
            $sum: {
              $cond: [{ $lte: ['$totalStock', 0] }, 1, 0],
            },
          },
        },
      },
    ]);

    return {
      all: counts?.all ?? 0,
      active: counts?.active ?? 0,
      draft: counts?.draft ?? 0,
      outOfStock: counts?.outOfStock ?? 0,
    };
  },
  async searchCatalog({ q, categoryId, minPrice, maxPrice, minRating, sort, skip, limit }) {
    const pipeline = [];

    const match = { ...catalogBaseFilter };
    if (categoryId) {
      match.categoryId = new mongoose.Types.ObjectId(categoryId);
    }
    if (minPrice != null || maxPrice != null) {
      match.basePrice = {};
      if (minPrice != null) match.basePrice.$gte = minPrice;
      if (maxPrice != null) match.basePrice.$lte = maxPrice;
    }
    if (q?.trim()) {
      match.$text = { $search: q.trim() };
    }

    pipeline.push({ $match: match });

    pipeline.push({
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'productId',
        as: 'reviews',
      },
    });

    pipeline.push({
      $addFields: {
        avgRating: { $avg: '$reviews.rating' },
        reviewCount: { $size: '$reviews' },
      },
    });

    if (minRating != null) {
      pipeline.push({ $match: { avgRating: { $gte: minRating } } });
    }

    let sortStage = { createdAt: -1 };
    switch (sort) {
      case 'price_asc':
        sortStage = { basePrice: 1 };
        break;
      case 'price_desc':
        sortStage = { basePrice: -1 };
        break;
      case 'rating':
        sortStage = { avgRating: -1, reviewCount: -1 };
        break;
      case 'newest':
        sortStage = { createdAt: -1 };
        break;
      default:
        if (q?.trim()) sortStage = { score: { $meta: 'textScore' }, createdAt: -1 };
    }

    pipeline.push({
      $facet: {
        data: [
          { $sort: sortStage },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              reviews: 0,
            },
          },
        ],
        total: [{ $count: 'count' }],
      },
    });

    const [result] = await Product.aggregate(pipeline);
    const items = result?.data ?? [];
    const total = result?.total?.[0]?.count ?? 0;
    return { items, total };
  },
};

export const variantRepository = {
  async create(data) {
    return ProductVariant.create(data);
  },
  async findById(id) {
    return ProductVariant.findById(id);
  },
  async listByProduct(productId) {
    return ProductVariant.find({ productId }).sort({ createdAt: 1 });
  },
  async update(id, productId, data) {
    return ProductVariant.findOneAndUpdate({ _id: id, productId }, data, { new: true });
  },
  async updateStock(id, stock) {
    return ProductVariant.findByIdAndUpdate(id, { stock }, { new: true });
  },
  async delete(id, productId) {
    return ProductVariant.findOneAndDelete({ _id: id, productId });
  },
  async decrementStock(variantId, quantity, session) {
    return ProductVariant.findOneAndUpdate(
      { _id: variantId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true, session }
    );
  },
  async countLowStock(threshold = 5) {
    return ProductVariant.countDocuments({ stock: { $lte: threshold } });
  },
  async inventoryRows() {
    return ProductVariant.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      { $match: { 'product.isDeleted': false } },
      {
        $project: {
          variantId: '$_id',
          productId: '$productId',
          name: '$product.name',
          sku: '$sku',
          stock: '$stock',
          price: '$price',
          attributes: '$attributes',
          isActive: '$product.isActive',
          updatedAt: '$updatedAt',
        },
      },
      { $sort: { name: 1, sku: 1 } },
    ]);
  },
};

export const reviewRepository = {
  async findByProductAndUser(productId, userId) {
    return Review.findOne({ productId, userId });
  },
  async create(data) {
    return Review.create(data);
  },
  async update(id, userId, data) {
    return Review.findOneAndUpdate({ _id: id, userId }, data, { new: true });
  },
  async delete(id, userId) {
    return Review.findOneAndDelete({ _id: id, userId });
  },
  async listByProduct(productId, { skip, limit }) {
    const filter = { productId };
    const [items, total] = await Promise.all([
      Review.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name'),
      Review.countDocuments(filter),
    ]);
    return { items, total };
  },
  async statsForProduct(productId) {
    const [stats] = await Review.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
    ]);
    return { avgRating: stats?.avgRating ?? 0, count: stats?.count ?? 0 };
  },
};
