import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { setIo } from './io.js';
import { registerShoppingRoomSocket } from './shoppingRoomSocket.js';

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_URL,
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Unauthorized'));
    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.sub;
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  registerShoppingRoomSocket(io);

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
  });

  setIo(io);
  return io;
}
