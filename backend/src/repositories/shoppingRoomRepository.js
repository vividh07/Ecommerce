import { ShoppingRoom } from '../models/ShoppingRoom.js';

export const shoppingRoomRepository = {
  async create(data) {
    return ShoppingRoom.create(data);
  },
  async findByCode(roomCode) {
    return ShoppingRoom.findOne({ roomCode: roomCode.toUpperCase() });
  },
  async findById(id) {
    return ShoppingRoom.findById(id);
  },
  async save(room) {
    return room.save();
  },
};
