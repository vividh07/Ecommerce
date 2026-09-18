import { postPurchaseDashboardService } from '../services/postPurchaseDashboardService.js';

export const dashboardController = {
  postPurchase: async (req, res) => {
    const filter = req.query.filter || 'all';
    const data = await postPurchaseDashboardService.getDashboard(req.user._id, filter);
    res.json({ success: true, data });
  },
};
