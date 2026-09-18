import { catalogService } from '../services/catalogService.js';

export const catalogController = {
  categories: async (_req, res) => {
    const categories = await catalogService.listCategories();
    res.json({ success: true, data: categories });
  },
  browse: async (req, res) => {
    const result = await catalogService.browse(req.validated);
    res.json({ success: true, ...result });
  },
  productDetail: async (req, res) => {
    const data = await catalogService.getProductDetail(req.params.productId);
    res.json({ success: true, data });
  },
};
