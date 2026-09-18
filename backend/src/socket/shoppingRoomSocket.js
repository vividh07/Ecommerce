import {
  buildRoomState,
  shoppingRoomService,
} from '../services/shoppingRoomService.js';
import { userRepository } from '../repositories/userRepository.js';

/** roomCode -> Map<socketId, { userId, name }> */
const presenceByRoom = new Map();

function socketRoomName(roomCode) {
  return `shopping:${roomCode.toUpperCase()}`;
}

function getPresenceList(roomCode) {
  const map = presenceByRoom.get(roomCode.toUpperCase());
  if (!map) return [];
  const byUser = new Map();
  for (const entry of map.values()) {
    byUser.set(entry.userId, entry);
  }
  return Array.from(byUser.values());
}

async function broadcastState(io, roomCode) {
  const room = await shoppingRoomService.getByCode(roomCode);
  const presence = getPresenceList(roomCode);
  const state = await buildRoomState(room, presence);
  io.to(socketRoomName(roomCode)).emit('shopping:state', state);
}

export function registerShoppingRoomSocket(io) {
  io.on('connection', (socket) => {
    socket.on('shopping:join', async ({ roomCode }, ack) => {
      try {
        const code = roomCode?.toUpperCase();
        await shoppingRoomService.joinRoom(code, socket.userId);
        const user = await userRepository.findById(socket.userId);
        const name = user?.name ?? 'User';

        if (!presenceByRoom.has(code)) presenceByRoom.set(code, new Map());
        presenceByRoom.get(code).set(socket.id, { userId: socket.userId, name });

        socket.join(socketRoomName(code));
        socket.data.shoppingRoomCode = code;

        await broadcastState(io, code);
        if (typeof ack === 'function') ack({ ok: true });
      } catch (err) {
        if (typeof ack === 'function') ack({ ok: false, message: err.message });
      }
    });

    socket.on('shopping:leave', async ({ roomCode }) => {
      const code = (roomCode || socket.data.shoppingRoomCode)?.toUpperCase();
      if (!code) return;
      const map = presenceByRoom.get(code);
      map?.delete(socket.id);
      socket.leave(socketRoomName(code));
      delete socket.data.shoppingRoomCode;
      await broadcastState(io, code);
    });

    socket.on('shopping:shortlist:add', async ({ roomCode, productId }) => {
      const code = roomCode.toUpperCase();
      await shoppingRoomService.addShortlist(code, socket.userId, productId);
      await broadcastState(io, code);
    });

    socket.on('shopping:shortlist:remove', async ({ roomCode, productId }) => {
      const code = roomCode.toUpperCase();
      await shoppingRoomService.removeShortlist(code, socket.userId, productId);
      await broadcastState(io, code);
    });

    socket.on('shopping:vote', async ({ roomCode, productId, vote }) => {
      const code = roomCode.toUpperCase();
      if (vote !== 'up' && vote !== 'down') return;
      await shoppingRoomService.castVote(code, socket.userId, productId, vote);
      await broadcastState(io, code);
    });

    socket.on('disconnect', async () => {
      const code = socket.data.shoppingRoomCode;
      if (!code) return;
      const map = presenceByRoom.get(code);
      map?.delete(socket.id);
      if (map && map.size === 0) presenceByRoom.delete(code);
      await broadcastState(io, code);
    });
  });
}
