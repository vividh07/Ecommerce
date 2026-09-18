import { buildRoomState, shoppingRoomService } from '../services/shoppingRoomService.js';

export const shoppingRoomController = {
  create: async (req, res) => {
    const room = await shoppingRoomService.createRoom(req.user._id);
    const state = await buildRoomState(room, []);
    res.status(201).json({ success: true, data: state });
  },
  get: async (req, res) => {
    const room = await shoppingRoomService.getByCode(req.params.roomCode);
    const state = await buildRoomState(room, []);
    res.json({ success: true, data: state });
  },
  join: async (req, res) => {
    const room = await shoppingRoomService.joinRoom(req.params.roomCode, req.user._id);
    const state = await buildRoomState(room, []);
    res.json({ success: true, data: state });
  },
  addToCart: async (req, res) => {
    const cart = await shoppingRoomService.addProductToMyCart(
      req.user._id,
      req.validated.productId,
      req.validated.cartId
    );
    res.json({ success: true, data: cart });
  },
  close: async (req, res) => {
    const room = await shoppingRoomService.closeRoom(req.params.roomCode, req.user._id);
    const state = await buildRoomState(room, []);
    res.json({ success: true, data: state });
  },
};
