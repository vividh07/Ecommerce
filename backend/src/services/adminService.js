import mongoose from 'mongoose';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, paginationMeta } from '../utils/pagination.js';
import { sellerRepository } from '../repositories/sellerRepository.js';
import { orderRepository } from '../repositories/orderRepository.js';
import { orderStatusHistoryRepository } from '../repositories/orderStatusHistoryRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { productRepository, variantRepository } from '../repositories/productRepository.js';
import { storeSettingsRepository } from '../repositories/storeSettingsRepository.js';
import { Product } from '../models/Product.js';
import { Order } from '../models/Order.js';
import { aggregateOrderStatus, canAdvanceStatus } from '../utils/orderStatus.js';
import { applyItemPostPurchaseFields } from '../utils/postPurchase.js';
import { getIo } from '../socket/io.js';

const REORDER_POINT = 5;

function orderNumberFromId(id) {
  const str = id?.toString?.() ?? String(id);
  return `#${str.slice(-6).toUpperCase()}`;
}

function inventoryStatus(stock) {
  if (stock <= 0) return 'Out';
  if (stock <= REORDER_POINT) return 'Low';
  return 'In';
}

function mapOrderListItem(order) {
  const obj = order.toObject ? order.toObject() : order;
  const customer = obj.userId;
  return {
    ...obj,
    orderNumber: orderNumberFromId(obj._id),
    productNames: (obj.items ?? []).map((i) => i.productName),
    customer: customer
      ? {
          _id: customer._id,
          name: customer.name,
          email: customer.email,
        }
      : null,
  };
}

function emitOrderUpdate(userId, order) {
  const io = getIo();
  if (io && userId) {
    io.to(`user:${userId}`).emit('order:updated', {
      orderId: order._id.toString(),
      status: order.status,
      sellerFulfillment: order.sellerFulfillment,
    });
  }
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

export const adminService = {
  async listPendingSellers(query) {
    const { page, limit, skip } = parsePagination(query);
    const { items, total } = await sellerRepository.listPending({ skip, limit });
    return { items, meta: paginationMeta({ page, limit, total }) };
  },

  async approveSeller(sellerId) {
    const seller = await sellerRepository.approve(sellerId);
    if (!seller) throw new ApiError(404, 'Seller not found');
    return seller;
  },

  async rejectSeller(sellerId) {
    const seller = await sellerRepository.softDelete(sellerId);
    if (!seller) throw new ApiError(404, 'Seller not found');
    return seller;
  },

  async getOverview() {
    const since7 = startOfDay(new Date());
    since7.setDate(since7.getDate() - 6);

    const [
      revenueAgg,
      orderCount,
      productCount,
      lowStockCount,
      pendingShipments,
      pendingSellers,
      recentOrders,
      trendRaw,
    ] = await Promise.all([
      orderRepository.sumPaidRevenue(),
      orderRepository.count({ isDeleted: false }),
      Product.countDocuments({ isDeleted: false }),
      variantRepository.countLowStock(REORDER_POINT),
      orderRepository.count({
        isDeleted: false,
        paymentStatus: 'PAID',
        status: { $in: ['PLACED', 'CONFIRMED'] },
      }),
      sellerRepository.listPending({ skip: 0, limit: 1 }).then((r) => r.total),
      orderRepository.recentPaidOrAny(8),
      orderRepository.revenueTrendDaily(since7),
    ]);

    const needsAttention = [];
    if (lowStockCount > 0) {
      needsAttention.push({
        type: 'LOW_STOCK',
        label: `${lowStockCount} product${lowStockCount === 1 ? '' : 's'} low in stock`,
        count: lowStockCount,
      });
    }
    if (pendingShipments > 0) {
      needsAttention.push({
        type: 'PENDING_SHIPMENTS',
        label: `${pendingShipments} pending shipment${pendingShipments === 1 ? '' : 's'}`,
        count: pendingShipments,
      });
    }
    if (pendingSellers > 0) {
      needsAttention.push({
        type: 'PENDING_SELLERS',
        label: `${pendingSellers} pending seller${pendingSellers === 1 ? '' : 's'}`,
        count: pendingSellers,
      });
    }

    const trendMap = new Map(trendRaw.map((r) => [r._id, r.total]));
    const revenueTrend = lastNDays(7).map((date) => ({
      date,
      total: trendMap.get(date) ?? 0,
    }));

    return {
      revenue: revenueAgg.total,
      orderCount,
      productCount,
      lowStockCount,
      needsAttention,
      recentOrders: recentOrders.map(mapOrderListItem),
      revenueTrend,
    };
  },

  async listOrders(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { isDeleted: false };

    if (query.status) filter.status = query.status;
    if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
    if (query.fulfillment) {
      filter.$or = [
        { status: query.fulfillment },
        { 'sellerFulfillment.status': query.fulfillment },
      ];
    }

    const q = query.q?.trim();
    if (q) {
      const or = [
        { 'items.productName': { $regex: q, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: q, $options: 'i' } },
        { couponCode: { $regex: q, $options: 'i' } },
      ];
      if (/^[a-fA-F0-9]{6}$/.test(q) || /^#[a-fA-F0-9]{6}$/i.test(q)) {
        const hex = q.replace('#', '');
        or.push({ $expr: { $regexMatch: { input: { $toString: '$_id' }, regex: `${hex}$`, options: 'i' } } });
      } else if (mongoose.isValidObjectId(q)) {
        or.push({ _id: new mongoose.Types.ObjectId(q) });
      }
      filter.$and = [...(filter.$and ?? []), { $or: or }];
    }

    const { items, total } = await orderRepository.listAdmin({ filter, skip, limit });
    return {
      items: items.map(mapOrderListItem),
      meta: paginationMeta({ page, limit, total }),
    };
  },

  async getOrder(orderId) {
    const order = await orderRepository.findByIdAdmin(orderId);
    if (!order) throw new ApiError(404, 'Order not found');
    const history = await orderStatusHistoryRepository.listByOrder(orderId);
    return {
      order: mapOrderListItem(order),
      history,
      customer: order.userId,
    };
  },

  async updateFulfillment(orderId, { status, note = '', sellerId }) {
    const order = await Order.findOne({ _id: orderId, isDeleted: false });
    if (!order) throw new ApiError(404, 'Order not found');

    if (sellerId) {
      const entry = order.sellerFulfillment?.find(
        (f) => f.sellerId.toString() === sellerId.toString()
      );
      if (!entry) throw new ApiError(400, 'Fulfillment record missing for seller');
      if (!canAdvanceStatus(entry.status, status)) {
        throw new ApiError(400, 'Invalid status transition');
      }
      entry.status = status;
      const statuses = order.sellerFulfillment.map((f) => f.status);
      order.status = aggregateOrderStatus(statuses, order.status);
    } else {
      if (!canAdvanceStatus(order.status, status)) {
        throw new ApiError(400, 'Invalid status transition');
      }
      order.status = status;
      if (order.sellerFulfillment?.length) {
        order.sellerFulfillment.forEach((f) => {
          f.status = status;
        });
      }
    }

    if (order.status === 'DELIVERED' && !order.deliveredAt) {
      await applyItemPostPurchaseFields(order);
    }

    await order.save();
    await orderStatusHistoryRepository.add({
      orderId: order._id,
      status,
      note: note || `Admin updated fulfillment to ${status}`,
      sellerId: sellerId || null,
      timestamp: new Date(),
    });

    emitOrderUpdate(order.userId?.toString?.() ?? order.userId, order);
    const populated = await orderRepository.findByIdAdmin(orderId);
    return mapOrderListItem(populated);
  },

  async listCustomers(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { role: 'CUSTOMER' };
    const q = query.q?.trim();
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ];
    }

    const { items, total } = await userRepository.listCustomers({ filter, skip, limit });
    const stats = await orderRepository.customerStats(items.map((u) => u._id));
    const statsMap = new Map(stats.map((s) => [s._id.toString(), s]));

    const enriched = items.map((user) => {
      const s = statsMap.get(user._id.toString());
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        isActive: !user.isDeleted,
        orderCount: s?.orderCount ?? 0,
        totalSpent: s?.totalSpent ?? 0,
        lastOrderAt: s?.lastOrderAt ?? null,
      };
    });

    return { items: enriched, meta: paginationMeta({ page, limit, total }) };
  },

  async listInventory(query) {
    const { page, limit, skip } = parsePagination(query);
    let rows = await variantRepository.inventoryRows();

    const q = query.q?.trim()?.toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.name?.toLowerCase().includes(q) ||
          r.sku?.toLowerCase().includes(q)
      );
    }

    rows = rows.map((r) => {
      const onHand = r.stock ?? 0;
      const status = inventoryStatus(onHand);
      return {
        variantId: r.variantId,
        productId: r.productId,
        name: r.name,
        sku: r.sku,
        onHand,
        reserved: 0,
        available: onHand,
        reorderPoint: REORDER_POINT,
        status,
        price: r.price,
        isActive: r.isActive,
        updatedAt: r.updatedAt,
      };
    });

    if (query.status) {
      rows = rows.filter((r) => r.status === query.status);
    }

    const total = rows.length;
    const items = rows.slice(skip, skip + limit);
    return { items, meta: paginationMeta({ page, limit, total }) };
  },

  async updateInventoryStock(variantId, { stock }) {
    const variant = await variantRepository.updateStock(variantId, stock);
    if (!variant) throw new ApiError(404, 'Variant not found');
    const product = await productRepository.findById(variant.productId);
    const onHand = variant.stock;
    return {
      variantId: variant._id,
      productId: variant.productId,
      name: product?.name ?? '',
      sku: variant.sku,
      onHand,
      reserved: 0,
      available: onHand,
      reorderPoint: REORDER_POINT,
      status: inventoryStatus(onHand),
    };
  },

  async listReturns(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {
      isDeleted: false,
      $or: [{ status: 'RETURNED' }, { paymentStatus: 'REFUNDED' }],
    };
    const { items, total } = await orderRepository.listAdmin({ filter, skip, limit });

    const returns = items.flatMap((order) => {
      const obj = order.toObject ? order.toObject() : order;
      const customer = obj.userId;
      const productName =
        obj.items?.map((i) => i.productName).join(', ') || 'Order items';
      return [
        {
          returnId: `RET-${obj._id.toString().slice(-6).toUpperCase()}`,
          orderId: obj._id,
          orderNumber: orderNumberFromId(obj._id),
          productName,
          customer: customer
            ? { _id: customer._id, name: customer.name, email: customer.email }
            : null,
          requestedAt: obj.updatedAt || obj.createdAt,
          status: obj.status === 'RETURNED' ? 'RETURNED' : 'REFUNDED',
          refundAmount: obj.paymentStatus === 'REFUNDED' ? obj.totalAmount : 0,
        },
      ];
    });

    return { items: returns, meta: paginationMeta({ page, limit, total }) };
  },

  async getReports() {
    const since = startOfDay(new Date());
    since.setDate(since.getDate() - 29);

    const matchPaid = {
      isDeleted: false,
      paymentStatus: 'PAID',
      createdAt: { $gte: since },
    };

    const [salesAgg, returnedCount, topProducts, salesByCategory] = await Promise.all([
      Order.aggregate([
        { $match: matchPaid },
        {
          $group: {
            _id: null,
            netSales: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
      ]),
      Order.countDocuments({
        isDeleted: false,
        createdAt: { $gte: since },
        $or: [{ status: 'RETURNED' }, { paymentStatus: 'REFUNDED' }],
      }),
      Order.aggregate([
        { $match: matchPaid },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            productName: { $first: '$items.productName' },
            unitsSold: { $sum: '$items.quantity' },
            revenue: { $sum: '$items.lineTotal' },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
      Order.aggregate([
        { $match: matchPaid },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.productId',
            foreignField: '_id',
            as: 'product',
          },
        },
        { $unwind: { path: '$product', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'categories',
            localField: 'product.categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id: '$category._id',
            categoryName: { $first: { $ifNull: ['$category.name', 'Uncategorized'] } },
            revenue: { $sum: '$items.lineTotal' },
            unitsSold: { $sum: '$items.quantity' },
          },
        },
        { $sort: { revenue: -1 } },
      ]),
    ]);

    const netSales = salesAgg[0]?.netSales ?? 0;
    const orders = salesAgg[0]?.orders ?? 0;
    const aov = orders > 0 ? netSales / orders : 0;
    const returnRate = orders > 0 ? returnedCount / orders : 0;

    return {
      periodDays: 30,
      netSales,
      orders,
      aov,
      returnRate,
      returnedCount,
      topProducts: topProducts.map((p) => ({
        productId: p._id,
        productName: p.productName,
        unitsSold: p.unitsSold,
        revenue: p.revenue,
      })),
      salesByCategory: salesByCategory.map((c) => ({
        categoryId: c._id,
        categoryName: c.categoryName,
        revenue: c.revenue,
        unitsSold: c.unitsSold,
      })),
    };
  },

  async getSettings() {
    return storeSettingsRepository.getSingleton();
  },

  async updateSettings(data) {
    return storeSettingsRepository.updateSingleton(data);
  },
};
