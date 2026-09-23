import { sellerService } from '../services/sellerService.js';
import { returnService } from '../services/returnService.js';

export const sellerController = {
  apply: async (req, res) => {
    const seller = await sellerService.apply(req.user._id, req.validated);
    res.status(201).json({ success: true, data: seller });
  },
  profile: async (req, res) => {
    const seller = await sellerService.getProfile(req.user._id);
    res.json({ success: true, data: seller });
  },
  updateProfile: async (req, res) => {
    const seller = await sellerService.updateProfile(req.user._id, req.validated);
    res.json({ success: true, data: seller });
  },
  overview: async (req, res) => {
    const data = await sellerService.getOverview(req.user._id);
    res.json({ success: true, data });
  },
  listOrders: async (req, res) => {
    const result = await sellerService.listOrders(req.user._id, req.validated ?? req.query);
    res.json({ success: true, ...result });
  },
  getOrder: async (req, res) => {
    const data = await sellerService.getOrder(req.user._id, req.params.orderId);
    res.json({ success: true, data });
  },
  listReturns: async (req, res) => {
    const result = await sellerService.listReturns(req.user._id, req.validated ?? req.query);
    res.json({ success: true, ...result });
  },
  approveReturn: async (req, res) => {
    const data = await returnService.approveReturn(req.user._id, req.params.returnId);
    res.json({ success: true, data });
  },
  payouts: async (req, res) => {
    const data = await sellerService.getPayouts(req.user._id);
    res.json({ success: true, data });
  },
  productStats: async (req, res) => {
    const data = await sellerService.getProductStats(req.user._id);
    res.json({ success: true, data });
  },
};
