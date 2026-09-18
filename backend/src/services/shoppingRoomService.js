import crypto from 'crypto';
import { ApiError } from '../utils/ApiError.js';
import { shoppingRoomRepository } from '../repositories/shoppingRoomRepository.js';
import { productRepository } from '../repositories/productRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { cartService } from './cartService.js';
import { variantRepository } from '../repositories/productRepository.js';

function generateRoomCode() {
  return crypto.randomBytes(3).toString('hex').toUpperCase();
}

function voteSummary(room, productId) {
  const pid = productId.toString();
  const votes = room.votes.filter((v) => v.productId.toString() === pid);
  const up = votes.filter((v) => v.vote === 'up').length;
  const down = votes.filter((v) => v.vote === 'down').length;
  return { up, down, score: up - down };
}

export async function buildRoomState(room, presence = []) {
  const userIds = [...new Set(room.participants.map((p) => p.userId.toString()))];
  const users = await Promise.all(userIds.map((id) => userRepository.findById(id)));
  const userMap = new Map(users.filter(Boolean).map((u) => [u._id.toString(), u.name]));

  const products = await Promise.all(
    room.shortlistedProducts.map(async (entry) => {
      const product = await productRepository.findById(entry.productId);
      if (!product || !product.isActive) return null;
      const summary = voteSummary(room, entry.productId);
      return {
        productId: product._id.toString(),
        name: product.name,
        basePrice: product.basePrice,
        image: product.images?.[0] ?? null,
        addedByUserId: entry.addedByUserId.toString(),
        addedByName: userMap.get(entry.addedByUserId.toString()) ?? 'Guest',
        addedAt: entry.addedAt,
        votes: summary,
      };
    })
  );

  return {
    id: room._id.toString(),
    roomCode: room.roomCode,
    hostUserId: room.hostUserId.toString(),
    status: room.status,
    participants: room.participants.map((p) => ({
      userId: p.userId.toString(),
      name: userMap.get(p.userId.toString()) ?? 'User',
      joinedAt: p.joinedAt,
    })),
    shortlist: products.filter(Boolean),
    presence,
    createdAt: room.createdAt,
  };
}

export const shoppingRoomService = {
  async createRoom(hostUserId) {
    let roomCode = generateRoomCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await shoppingRoomRepository.findByCode(roomCode);
      if (!existing) break;
      roomCode = generateRoomCode();
      attempts++;
    }
    const room = await shoppingRoomRepository.create({
      hostUserId,
      roomCode,
      participants: [{ userId: hostUserId, joinedAt: new Date() }],
    });
    return buildRoomState(room, []);
  },

  async getByCode(roomCode) {
    const room = await shoppingRoomRepository.findByCode(roomCode);
    if (!room) throw new ApiError(404, 'Room not found');
    return room;
  },

  async joinRoom(roomCode, userId) {
    const room = await this.getByCode(roomCode);
    if (room.status !== 'ACTIVE') throw new ApiError(400, 'Room is closed');
    const exists = room.participants.some((p) => p.userId.toString() === userId.toString());
    if (!exists) {
      room.participants.push({ userId, joinedAt: new Date() });
      await shoppingRoomRepository.save(room);
    }
    return room;
  },

  async addShortlist(roomCode, userId, productId) {
    const room = await this.getByCode(roomCode);
    if (room.status !== 'ACTIVE') throw new ApiError(400, 'Room is closed');
    const isParticipant = room.participants.some((p) => p.userId.toString() === userId.toString());
    if (!isParticipant) throw new ApiError(403, 'Join the room first');

    const product = await productRepository.findById(productId);
    if (!product || !product.isActive) throw new ApiError(404, 'Product not found');

    const dup = room.shortlistedProducts.some((s) => s.productId.toString() === productId);
    if (!dup) {
      room.shortlistedProducts.push({ productId, addedByUserId: userId, addedAt: new Date() });
      await shoppingRoomRepository.save(room);
    }
    return room;
  },

  async removeShortlist(roomCode, userId, productId) {
    const room = await this.getByCode(roomCode);
    room.shortlistedProducts = room.shortlistedProducts.filter(
      (s) => s.productId.toString() !== productId
    );
    room.votes = room.votes.filter((v) => v.productId.toString() !== productId);
    await shoppingRoomRepository.save(room);
    return room;
  },

  async castVote(roomCode, userId, productId, vote) {
    const room = await this.getByCode(roomCode);
    if (room.status !== 'ACTIVE') throw new ApiError(400, 'Room is closed');
    const isParticipant = room.participants.some((p) => p.userId.toString() === userId.toString());
    if (!isParticipant) throw new ApiError(403, 'Join the room first');
    const listed = room.shortlistedProducts.some((s) => s.productId.toString() === productId);
    if (!listed) throw new ApiError(400, 'Product not in shortlist');

    const idx = room.votes.findIndex(
      (v) => v.userId.toString() === userId.toString() && v.productId.toString() === productId
    );
    if (idx >= 0) room.votes[idx].vote = vote;
    else room.votes.push({ productId, userId, vote });
    await shoppingRoomRepository.save(room);
    return room;
  },

  async addProductToMyCart(userId, productId, cartId) {
    const variants = await variantRepository.listByProduct(productId);
    const variant = variants.find((v) => v.stock > 0);
    if (!variant) throw new ApiError(400, 'No in-stock variant');
    return cartService.addItem(userId, cartId, {
      variantId: variant._id.toString(),
      quantity: 1,
    });
  },

  async closeRoom(roomCode, hostUserId) {
    const room = await this.getByCode(roomCode);
    if (room.hostUserId.toString() !== hostUserId.toString()) {
      throw new ApiError(403, 'Only the host can close the room');
    }
    room.status = 'CLOSED';
    await shoppingRoomRepository.save(room);
    return room;
  },
};
