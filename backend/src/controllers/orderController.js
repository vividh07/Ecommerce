import { orderService } from '../services/orderService.js';
import { orderTrackingService } from '../services/orderTrackingService.js';
import { returnService } from '../services/returnService.js';

export const orderController = {
  list: async (req, res) => {
    const result = await orderService.listUserOrders(req.user._id, req.query);
    res.json({ success: true, ...result });
  },
  get: async (req, res) => {
    const data = await orderService.getUserOrder(req.user._id, req.params.orderId);
    res.json({ success: true, data });
  },
  sellerList: async (req, res) => {
    const result = await orderService.listSellerOrders(req.user._id, req.query);
    res.json({ success: true, ...result });
  },
  sellerUpdateStatus: async (req, res) => {
    const order = await orderTrackingService.updateSellerStatus(
      req.user._id,
      req.params.orderId,
      req.validated.status,
      req.validated.note
    );
    res.json({ success: true, data: order });
  },
  confirmDelivery: async (req, res) => {
    const order = await orderTrackingService.confirmDelivery(req.user._id, req.params.orderId);
    res.json({ success: true, data: order });
  },
  requestReturn: async (req, res) => {
    const data = await returnService.requestReturn(req.user._id, req.params.orderId, req.validated);
    res.status(201).json({ success: true, data });
  },
};
