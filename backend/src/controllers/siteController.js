import { siteService } from '../services/siteService.js';

export const siteController = {
  subscribe: async (req, res) => {
    const data = await siteService.subscribeNewsletter(req.validated);
    res.status(201).json({ success: true, data });
  },
  contact: async (req, res) => {
    const data = await siteService.submitContact(req.validated);
    res.status(201).json({ success: true, data, message: 'Message received' });
  },
  trackOrder: async (req, res) => {
    const data = await siteService.trackOrder(req.validated);
    res.json({ success: true, data });
  },
};
