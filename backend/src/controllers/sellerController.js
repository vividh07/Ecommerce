import { sellerService } from '../services/sellerService.js';

export const sellerController = {
  apply: async (req, res) => {
    const seller = await sellerService.apply(req.user._id, req.validated);
    res.status(201).json({ success: true, data: seller });
  },
  profile: async (req, res) => {
    const seller = await sellerService.getProfile(req.user._id);
    res.json({ success: true, data: seller });
  },
};
