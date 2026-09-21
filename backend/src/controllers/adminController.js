import { adminService } from '../services/adminService.js';

export const adminController = {
  pendingSellers: async (req, res) => {
    const result = await adminService.listPendingSellers(req.query);
    res.json({ success: true, ...result });
  },
  approveSeller: async (req, res) => {
    const seller = await adminService.approveSeller(req.params.sellerId);
    res.json({ success: true, data: seller });
  },
  rejectSeller: async (req, res) => {
    const seller = await adminService.rejectSeller(req.params.sellerId);
    res.json({ success: true, data: seller });
  },

  overview: async (req, res) => {
    const data = await adminService.getOverview();
    res.json({ success: true, data });
  },

  listOrders: async (req, res) => {
    const result = await adminService.listOrders(req.validated ?? req.query);
    res.json({ success: true, ...result });
  },

  getOrder: async (req, res) => {
    const data = await adminService.getOrder(req.params.orderId);
    res.json({ success: true, data });
  },

  updateFulfillment: async (req, res) => {
    const order = await adminService.updateFulfillment(req.params.orderId, req.validated);
    res.json({ success: true, data: order });
  },

  listCustomers: async (req, res) => {
    const result = await adminService.listCustomers(req.validated ?? req.query);
    res.json({ success: true, ...result });
  },

  listInventory: async (req, res) => {
    const result = await adminService.listInventory(req.validated ?? req.query);
    res.json({ success: true, ...result });
  },

  updateInventory: async (req, res) => {
    const row = await adminService.updateInventoryStock(req.params.variantId, req.validated);
    res.json({ success: true, data: row });
  },

  listReturns: async (req, res) => {
    const result = await adminService.listReturns(req.validated ?? req.query);
    res.json({ success: true, ...result });
  },

  reports: async (req, res) => {
    const data = await adminService.getReports();
    res.json({ success: true, data });
  },

  getSettings: async (req, res) => {
    const data = await adminService.getSettings();
    res.json({ success: true, data });
  },

  updateSettings: async (req, res) => {
    const data = await adminService.updateSettings(req.validated);
    res.json({ success: true, data });
  },
};
