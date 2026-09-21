import { productService } from '../services/productService.js';

export const productController = {
  create: async (req, res) => {
    const product = await productService.createProduct(req.user._id, req.validated);
    res.status(201).json({ success: true, data: product });
  },
  update: async (req, res) => {
    const product = await productService.updateProduct(req.user._id, req.params.productId, req.validated);
    res.json({ success: true, data: product });
  },
  delete: async (req, res) => {
    await productService.deleteProduct(req.user._id, req.params.productId);
    res.json({ success: true, message: 'Product removed' });
  },
  listMine: async (req, res) => {
    const result = await productService.listSellerProducts(req.user._id, req.query);
    res.json({ success: true, ...result });
  },
  addVariant: async (req, res) => {
    const variant = await productService.addVariant(req.user._id, req.params.productId, req.validated);
    res.status(201).json({ success: true, data: variant });
  },
  updateVariant: async (req, res) => {
    const variant = await productService.updateVariant(
      req.user._id,
      req.params.productId,
      req.params.variantId,
      req.validated
    );
    res.json({ success: true, data: variant });
  },
  deleteVariant: async (req, res) => {
    await productService.deleteVariant(req.user._id, req.params.productId, req.params.variantId);
    res.json({ success: true, message: 'Variant removed' });
  },
  adminList: async (req, res) => {
    const result = await productService.adminListProducts(req.query);
    res.json({ success: true, ...result });
  },
  adminGet: async (req, res) => {
    const product = await productService.adminGetProduct(req.params.productId);
    res.json({ success: true, data: product });
  },
  adminToggle: async (req, res) => {
    const product = await productService.adminToggleProduct(req.params.productId, req.validated);
    res.json({ success: true, data: product });
  },
};
