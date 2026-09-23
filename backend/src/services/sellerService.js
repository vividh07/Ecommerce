import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { sellerRepository } from '../repositories/sellerRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { orderStatusHistoryRepository } from '../repositories/orderStatusHistoryRepository.js';
import { productRepository } from '../repositories/productRepository.js';
import { returnRequestRepository } from '../repositories/returnRequestRepository.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';

const PLATFORM_FEE_RATE = 0.1;

async function requireSeller(userId) {
  const seller = await sellerRepository.findByUserId(userId);
  if (!seller) throw new ApiError(404, 'Seller profile not found');
  return seller;
}

async function requireApprovedSeller(userId) {
  const seller = await requireSeller(userId);
  if (!seller.isApproved) throw new ApiError(403, 'Seller account pending approval');
  return seller;
}

function orderNumberFromId(id) {
  const str = id?.toString?.() ?? String(id);
  return `#${str.slice(-6).toUpperCase()}`;
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function lastNDays(n) {
  const days = [];
  const today = startOfDay(new Date());
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function sellerObjectId(sellerId) {
  return sellerId instanceof mongoose.Types.ObjectId
    ? sellerId
    : new mongoose.Types.ObjectId(sellerId);
}

function myFulfillment(order, sellerId) {
  return (
    order.sellerFulfillment?.find((f) => f.sellerId.toString() === sellerId.toString()) ?? null
  );
}

function sellerItems(order, sellerId) {
  return (order.items ?? []).filter((i) => i.sellerId.toString() === sellerId.toString());
}

function sellerShare(order, sellerId) {
  const row = order.sellerBreakdown?.find(
    (b) => b.sellerId.toString() === sellerId.toString()
  );
  if (row) return row.subtotal ?? 0;
  return sellerItems(order, sellerId).reduce((sum, i) => sum + (i.lineTotal ?? 0), 0);
}

function mapSellerOrderListItem(order, sellerId, imageByProductId = new Map()) {
  const obj = order.toObject ? order.toObject() : order;
  const customer = obj.userId;
  const items = sellerItems(obj, sellerId);
  const first = items[0];
  const productImage = first
    ? imageByProductId.get(first.productId?.toString?.() ?? String(first.productId)) ?? null
    : null;

  return {
    ...obj,
    items,
    orderNumber: orderNumberFromId(obj._id),
    myFulfillment: myFulfillment(obj, sellerId),
    productName: first?.productName ?? null,
    productImage,
    customer: customer
      ? {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
        }
      : null,
  };
}

async function loadProductImages(productIds) {
  const ids = [...new Set(productIds.filter(Boolean).map((id) => id.toString()))];
  if (!ids.length) return new Map();
  const products = await Product.find({
    _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) },
  }).select('images');
  const map = new Map();
  for (const p of products) {
    map.set(p._id.toString(), p.images?.[0] ?? null);
  }
  return map;
}

function buildSellerOrderSearchFilter(sellerId, query) {
  const filter = {};
  const sid = sellerObjectId(sellerId);

  if (query.status) {
    filter.sellerFulfillment = {
      $elemMatch: { sellerId: sid, status: query.status },
    };
  }

  const q = query.q?.trim();
  if (q) {
    const or = [
      { 'items.productName': { $regex: q, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: q, $options: 'i' } },
    ];
    if (/^[a-fA-F0-9]{6}$/.test(q) || /^#[a-fA-F0-9]{6}$/i.test(q)) {
      const hex = q.replace('#', '');
      or.push({
        $expr: {
          $regexMatch: {
            input: { $toString: '$_id' },
            regex: `${hex}$`,
            options: 'i',
          },
        },
      });
    } else if (mongoose.isValidObjectId(q)) {
      or.push({ _id: new mongoose.Types.ObjectId(q) });
    }
    filter.$and = [...(filter.$and ?? []), { $or: or }];
  }

  return filter;
}

export const sellerService = {
  async apply(userId, data) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    if (user.role !== 'SELLER' && user.role !== 'ADMIN') {
      throw new ApiError(403, 'Register as a seller to apply');
    }

    const existing = await sellerRepository.findByUserId(userId);
    if (existing) throw new ApiError(409, 'Seller profile already exists');

    return sellerRepository.create({ userId, ...data, isApproved: false });
  },

  async getProfile(userId) {
    return requireSeller(userId);
  },

  async updateProfile(userId, data) {
    await requireSeller(userId);
    const updated = await sellerRepository.updateByUserId(userId, data);
    if (!updated) throw new ApiError(404, 'Seller profile not found');
    return updated;
  },

  async getOverview(userId) {
    const seller = await requireApprovedSeller(userId);
    const sid = sellerObjectId(seller._id);
    const since30 = startOfDay(new Date());
    since30.setDate(since30.getDate() - 29);

    const sellerItemMatch = {
      isDeleted: false,
      'items.sellerId': sid,
    };

    const [
      revenueAgg,
      orderCount,
      productStats,
      pendingDispatch,
      returnsCount,
      recentOrders,
      trendRaw,
    ] = await Promise.all([
      Order.aggregate([
        { $match: { ...sellerItemMatch, paymentStatus: 'PAID' } },
        { $unwind: '$items' },
        { $match: { 'items.sellerId': sid } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$items.lineTotal' },
          },
        },
      ]),
      Order.countDocuments(sellerItemMatch),
      productRepository.countSellerStats(seller._id),
      Order.countDocuments({
        ...sellerItemMatch,
        sellerFulfillment: {
          $elemMatch: { sellerId: sid, status: { $in: ['PLACED', 'CONFIRMED'] } },
        },
      }),
      returnRequestRepository.countOpenBySeller(seller._id),
      Order.find(sellerItemMatch)
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('userId', 'name email'),
      Order.aggregate([
        {
          $match: {
            ...sellerItemMatch,
            paymentStatus: 'PAID',
            createdAt: { $gte: since30 },
          },
        },
        { $unwind: '$items' },
        { $match: { 'items.sellerId': sid } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            total: { $sum: '$items.lineTotal' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const actionNeeded = [];
    if (pendingDispatch > 0) {
      actionNeeded.push({
        type: 'PENDING_DISPATCH',
        label: `${pendingDispatch} order${pendingDispatch === 1 ? '' : 's'} need dispatch`,
        count: pendingDispatch,
      });
    }
    if (productStats.outOfStock > 0) {
      actionNeeded.push({
        type: 'OUT_OF_STOCK',
        label: `${productStats.outOfStock} product${productStats.outOfStock === 1 ? '' : 's'} out of stock`,
        count: productStats.outOfStock,
      });
    }
    if (returnsCount > 0) {
      actionNeeded.push({
        type: 'RETURNS',
        label: `${returnsCount} return${returnsCount === 1 ? '' : 's'} to review`,
        count: returnsCount,
      });
    }
    if (!seller.onboardingComplete) {
      actionNeeded.push({
        type: 'ONBOARDING',
        label: 'Finish store onboarding',
        count: 1,
      });
    }

    const imageByProductId = await loadProductImages(
      recentOrders.flatMap((o) => {
        const first = sellerItems(o, seller._id)[0];
        return first?.productId ? [first.productId] : [];
      })
    );

    const trendMap = new Map(trendRaw.map((r) => [r._id, r.total]));
    const salesTrend = lastNDays(30).map((date) => ({
      date,
      total: trendMap.get(date) ?? 0,
    }));

    return {
      revenue: revenueAgg[0]?.revenue ?? 0,
      orderCount,
      productCount: productStats.all,
      pendingDispatch,
      actionNeeded,
      recentOrders: recentOrders.map((o) => mapSellerOrderListItem(o, seller._id, imageByProductId)),
      salesTrend,
    };
  },

  async listOrders(userId, query) {
    const seller = await requireApprovedSeller(userId);
    const { page, limit, skip } = parsePagination(query);
    const extraFilter = {
      paymentStatus: 'PAID',
      ...buildSellerOrderSearchFilter(seller._id, query),
    };
    const { items, total } = await orderRepository.listBySeller(seller._id, {
      skip,
      limit,
      filter: extraFilter,
    });

    const imageByProductId = await loadProductImages(
      items.flatMap((o) => {
        const first = sellerItems(o, seller._id)[0];
        return first?.productId ? [first.productId] : [];
      })
    );

    return {
      items: items.map((o) => mapSellerOrderListItem(o, seller._id, imageByProductId)),
      meta: paginationMeta({ page, limit, total }),
    };
  },

  async getOrder(userId, orderId) {
    const seller = await requireApprovedSeller(userId);
    const order = await orderRepository.findByIdForSeller(orderId, seller._id);
    if (!order) throw new ApiError(404, 'Order not found');

    const history = await orderStatusHistoryRepository.listByOrder(orderId);
    const filteredHistory = history.filter(
      (h) => !h.sellerId || h.sellerId.toString() === seller._id.toString()
    );

    const imageByProductId = await loadProductImages(
      sellerItems(order, seller._id).map((i) => i.productId)
    );

    return {
      order: mapSellerOrderListItem(order, seller._id, imageByProductId),
      history: filteredHistory,
      customer: order.userId,
    };
  },

  async listReturns(userId, query) {
    const seller = await requireApprovedSeller(userId);
    const { page, limit, skip } = parsePagination(query);
    const { items, total } = await returnRequestRepository.listBySeller(seller._id, {
      skip,
      limit,
    });

    const imageByProductId = await loadProductImages(items.map((r) => r.productId));

    const returns = items.map((doc) => {
      const obj = doc.toObject ? doc.toObject() : doc;
      const customer = obj.userId;
      const idStr = obj._id.toString();
      return {
        returnId: idStr,
        displayId: `RET-${idStr.slice(-6).toUpperCase()}`,
        orderId: obj.orderId,
        orderNumber: orderNumberFromId(obj.orderId),
        productName: obj.productName,
        variantLabel: obj.variantLabel || '',
        reason: obj.reason,
        note: obj.notes || '',
        image: imageByProductId.get(obj.productId?.toString?.() ?? String(obj.productId)) || null,
        price: obj.lineTotal,
        customer: customer
          ? { _id: customer._id, name: customer.name, email: customer.email }
          : null,
        requestedAt: obj.createdAt,
        status: obj.status,
        refundAmount: obj.refundAmount ?? 0,
        action: obj.action,
      };
    });

    return { items: returns, meta: paginationMeta({ page, limit, total }) };
  },

  async getPayouts(userId) {
    const seller = await requireApprovedSeller(userId);
    const sid = sellerObjectId(seller._id);
    const since30 = startOfDay(new Date());
    since30.setDate(since30.getDate() - 29);

    const [availableAgg, pendingAgg, monthlyAgg] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            isDeleted: false,
            paymentStatus: 'PAID',
            'items.sellerId': sid,
            $or: [
              { status: 'DELIVERED' },
              {
                sellerFulfillment: {
                  $elemMatch: { sellerId: sid, status: 'DELIVERED' },
                },
              },
            ],
            createdAt: { $gte: since30 },
          },
        },
        { $unwind: '$sellerBreakdown' },
        { $match: { 'sellerBreakdown.sellerId': sid } },
        {
          $group: {
            _id: null,
            gross: { $sum: '$sellerBreakdown.subtotal' },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            isDeleted: false,
            paymentStatus: 'PAID',
            'items.sellerId': sid,
            sellerFulfillment: {
              $elemMatch: {
                sellerId: sid,
                status: { $in: ['PLACED', 'CONFIRMED', 'SHIPPED', 'OUT_FOR_DELIVERY'] },
              },
            },
          },
        },
        { $unwind: '$sellerBreakdown' },
        { $match: { 'sellerBreakdown.sellerId': sid } },
        {
          $group: {
            _id: null,
            pending: { $sum: '$sellerBreakdown.subtotal' },
          },
        },
      ]),
      Order.aggregate([
        {
          $match: {
            isDeleted: false,
            paymentStatus: 'PAID',
            'items.sellerId': sid,
            $or: [
              { status: 'DELIVERED' },
              {
                sellerFulfillment: {
                  $elemMatch: { sellerId: sid, status: 'DELIVERED' },
                },
              },
            ],
          },
        },
        { $unwind: '$sellerBreakdown' },
        { $match: { 'sellerBreakdown.sellerId': sid } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m', date: '$createdAt' },
            },
            gross: { $sum: '$sellerBreakdown.subtotal' },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 6 },
      ]),
    ]);

    const grossAvailable = availableAgg[0]?.gross ?? 0;
    const available = Math.round(grossAvailable * (1 - PLATFORM_FEE_RATE) * 100) / 100;
    const pending = pendingAgg[0]?.pending ?? 0;

    const history = monthlyAgg.map((row) => ({
      id: `PAY-${row._id.replace('-', '')}`,
      period: row._id,
      amount: Math.round(row.gross * (1 - PLATFORM_FEE_RATE) * 100) / 100,
      gross: row.gross,
      status: 'SYNTHETIC',
      note: 'Estimated monthly payout from delivered PAID orders (demo; paidOut ledger not stored)',
    }));

    return {
      available,
      pending,
      paidOut: 0,
      platformFeeRate: PLATFORM_FEE_RATE,
      note: 'available = PAID+DELIVERED seller share (last 30d) after demo platform fee; paidOut ledger not implemented',
      history,
    };
  },

  async getProductStats(userId) {
    const seller = await requireApprovedSeller(userId);
    return productRepository.countSellerStats(seller._id);
  },
};
