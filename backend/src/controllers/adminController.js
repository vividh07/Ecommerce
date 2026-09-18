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
};
