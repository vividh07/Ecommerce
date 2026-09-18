import { orderService } from '../services/orderService.js';

export const orderController = {
  list: async (req, res) => {
    const result = await orderService.listUserOrders(req.user._id, req.query);
    res.json({ success: true, ...result });
  },
  get: async (req, res) => {
    const order = await orderService.getUserOrder(req.user._id, req.params.orderId);
    res.json({ success: true, data: order });
  },
  sellerList: async (req, res) => {
    const result = await orderService.listSellerOrders(req.user._id, req.query);
    res.json({ success: true, ...result });
  },
};
