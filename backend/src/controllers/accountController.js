import { accountService } from '../services/accountService.js';

export const accountController = {
  updateProfile: async (req, res) => {
    const data = await accountService.updateProfile(req.user._id, req.validated);
    res.json({ success: true, data });
  },
  listAddresses: async (req, res) => {
    const items = await accountService.listAddresses(req.user._id);
    res.json({ success: true, items });
  },
  addAddress: async (req, res) => {
    const data = await accountService.addAddress(req.user._id, req.validated);
    res.status(201).json({ success: true, data });
  },
  updateAddress: async (req, res) => {
    const data = await accountService.updateAddress(
      req.user._id,
      req.params.addressId,
      req.validated
    );
    res.json({ success: true, data });
  },
  deleteAddress: async (req, res) => {
    const data = await accountService.deleteAddress(req.user._id, req.params.addressId);
    res.json({ success: true, data });
  },
  listNotifications: async (req, res) => {
    const items = await accountService.listNotifications(req.user._id);
    res.json({ success: true, items });
  },
  markNotificationRead: async (req, res) => {
    const data = await accountService.markNotificationRead(
      req.user._id,
      req.params.notificationId
    );
    res.json({ success: true, data });
  },
  markAllNotificationsRead: async (req, res) => {
    const items = await accountService.markAllNotificationsRead(req.user._id);
    res.json({ success: true, items });
  },
};
