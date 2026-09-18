import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from './api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://127.0.0.1:4871';

let socket: Socket | null = null;

export function getSocket() {
  const token = getAccessToken();
  if (!token) return null;
  if (!socket) {
    socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
