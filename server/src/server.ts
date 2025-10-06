import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { Socket } from 'socket.io';
import { ENV } from './env';
import authRouter from './routes/auth';
import chatsRouter from './routes/chats';
import usersRouter from './routes/users';
import { prisma } from './prisma';
import jwt from 'jsonwebtoken';
import { JwtUserPayload } from './types';

const app = express();
// Allow any origin in dev for easier local setup; restrict in prod
const apiCorsOrigin: any = ENV.NODE_ENV === 'development' ? true : ENV.CLIENT_ORIGIN;
app.use(cors({ origin: apiCorsOrigin, credentials: false }));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/chats', chatsRouter);
app.use('/api/users', usersRouter);

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: { origin: ENV.NODE_ENV === 'development' ? '*' : ENV.CLIENT_ORIGIN, credentials: false },
});

type SocketUser = JwtUserPayload & { socketId: string };

const userIdToSockets = new Map<string, Set<string>>();
const socketIdToUser = new Map<string, SocketUser>();

io.use((socket: Socket, next: (err?: Error) => void) => {
  const token = socket.handshake.auth?.token as string | undefined;
  if (!token) return next(new Error('Missing token'));
  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET) as JwtUserPayload;
    (socket as any).user = payload;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket: Socket) => {
  const user = (socket as any).user as JwtUserPayload;
  socketIdToUser.set(socket.id, { ...user, socketId: socket.id });
  if (!userIdToSockets.has(user.userId)) userIdToSockets.set(user.userId, new Set());
  userIdToSockets.get(user.userId)!.add(socket.id);

  socket.join(`user:${user.userId}`);

  socket.on('chat:join', async (chatId: string) => {
    const membership = await prisma.chatMember.findFirst({ where: { chatId, userId: user.userId } });
    if (membership) socket.join(`chat:${chatId}`);
  });

  socket.on('chat:leave', (chatId: string) => {
    socket.leave(`chat:${chatId}`);
  });

  socket.on('message:send', async (data: { chatId: string; content: string }) => {
    const membership = await prisma.chatMember.findFirst({ where: { chatId: data.chatId, userId: user.userId } });
    if (!membership) return;
    const message = await prisma.message.create({
      data: { chatId: data.chatId, senderId: user.userId, content: data.content },
      include: { sender: { select: { id: true, username: true } } },
    });
    await prisma.chat.update({ where: { id: data.chatId }, data: { updatedAt: new Date() } });
    io.to(`chat:${data.chatId}`).emit('message:new', message);
    const members = await prisma.chatMember.findMany({ where: { chatId: data.chatId } });
    members.forEach((m: { userId: string }) => io.to(`user:${m.userId}`).emit('chat:updated', { chatId: data.chatId }));
  });

  socket.on('typing:start', (chatId: string) => {
    socket.to(`chat:${chatId}`).emit('typing', { chatId, userId: user.userId, typing: true });
  });

  socket.on('typing:stop', (chatId: string) => {
    socket.to(`chat:${chatId}`).emit('typing', { chatId, userId: user.userId, typing: false });
  });

  socket.on('disconnect', () => {
    const mapped = socketIdToUser.get(socket.id);
    if (mapped) {
      const set = userIdToSockets.get(mapped.userId);
      if (set) {
        set.delete(socket.id);
        if (set.size === 0) userIdToSockets.delete(mapped.userId);
      }
      socketIdToUser.delete(socket.id);
    }
  });
});

httpServer.listen(ENV.PORT, () => {
  console.log(`Server listening on http://localhost:${ENV.PORT}`);
});
