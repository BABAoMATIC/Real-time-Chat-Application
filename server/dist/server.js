"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const env_1 = require("./env");
const auth_1 = __importDefault(require("./routes/auth"));
const chats_1 = __importDefault(require("./routes/chats"));
const users_1 = __importDefault(require("./routes/users"));
const prisma_1 = require("./prisma");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: env_1.ENV.CLIENT_ORIGIN, credentials: true }));
app.use(express_1.default.json());
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', auth_1.default);
app.use('/api/chats', chats_1.default);
app.use('/api/users', users_1.default);
const httpServer = http_1.default.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: { origin: env_1.ENV.CLIENT_ORIGIN, credentials: true },
});
const userIdToSockets = new Map();
const socketIdToUser = new Map();
io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token)
        return next(new Error('Missing token'));
    try {
        const payload = jsonwebtoken_1.default.verify(token, env_1.ENV.JWT_SECRET);
        socket.user = payload;
        next();
    }
    catch {
        next(new Error('Invalid token'));
    }
});
io.on('connection', (socket) => {
    const user = socket.user;
    socketIdToUser.set(socket.id, { ...user, socketId: socket.id });
    if (!userIdToSockets.has(user.userId))
        userIdToSockets.set(user.userId, new Set());
    userIdToSockets.get(user.userId).add(socket.id);
    socket.join(`user:${user.userId}`);
    socket.on('chat:join', async (chatId) => {
        const membership = await prisma_1.prisma.chatMember.findFirst({ where: { chatId, userId: user.userId } });
        if (membership)
            socket.join(`chat:${chatId}`);
    });
    socket.on('chat:leave', (chatId) => {
        socket.leave(`chat:${chatId}`);
    });
    socket.on('message:send', async (data) => {
        const membership = await prisma_1.prisma.chatMember.findFirst({ where: { chatId: data.chatId, userId: user.userId } });
        if (!membership)
            return;
        const message = await prisma_1.prisma.message.create({
            data: { chatId: data.chatId, senderId: user.userId, content: data.content },
            include: { sender: { select: { id: true, username: true } } },
        });
        await prisma_1.prisma.chat.update({ where: { id: data.chatId }, data: { updatedAt: new Date() } });
        io.to(`chat:${data.chatId}`).emit('message:new', message);
        const members = await prisma_1.prisma.chatMember.findMany({ where: { chatId: data.chatId } });
        members.forEach((m) => io.to(`user:${m.userId}`).emit('chat:updated', { chatId: data.chatId }));
    });
    socket.on('typing:start', (chatId) => {
        socket.to(`chat:${chatId}`).emit('typing', { chatId, userId: user.userId, typing: true });
    });
    socket.on('typing:stop', (chatId) => {
        socket.to(`chat:${chatId}`).emit('typing', { chatId, userId: user.userId, typing: false });
    });
    socket.on('disconnect', () => {
        const mapped = socketIdToUser.get(socket.id);
        if (mapped) {
            const set = userIdToSockets.get(mapped.userId);
            if (set) {
                set.delete(socket.id);
                if (set.size === 0)
                    userIdToSockets.delete(mapped.userId);
            }
            socketIdToUser.delete(socket.id);
        }
    });
});
httpServer.listen(env_1.ENV.PORT, () => {
    console.log(`Server listening on http://localhost:${env_1.ENV.PORT}`);
});
//# sourceMappingURL=server.js.map