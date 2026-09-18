import { authService } from '../services/authService.js';

export const authController = {
  register: async (req, res) => {
    const result = await authService.register(req.validated);
    res.status(201).json({ success: true, data: result });
  },
  login: async (req, res) => {
    const result = await authService.login(req.validated);
    res.json({ success: true, data: result });
  },
  refresh: async (req, res) => {
    const result = await authService.refresh(req.validated);
    res.json({ success: true, data: result });
  },
  logout: async (req, res) => {
    await authService.logout(req.user._id);
    res.json({ success: true, message: 'Logged out' });
  },
  me: async (req, res) => {
    const result = await authService.me(req.user._id);
    res.json({ success: true, data: result });
  },
};
