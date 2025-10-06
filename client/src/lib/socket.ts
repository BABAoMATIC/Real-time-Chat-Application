import { io, Socket } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

export function createSocket(token: string): Socket {
  return io(API_BASE, {
    auth: { token },
    transports: ['websocket'],
  });
}
