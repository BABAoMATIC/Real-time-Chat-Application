"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/', async (req, res) => {
    const userId = req.user.userId;
    const memberships = await prisma_1.prisma.chatMember.findMany({
        where: { userId },
        include: { chat: true },
        orderBy: { joinedAt: 'desc' },
    });
    const chats = await prisma_1.prisma.chat.findMany({
        where: { id: { in: memberships.map((m) => m.chatId) } },
        include: {
            members: { include: { user: { select: { id: true, username: true } } } },
            messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { sender: { select: { id: true, username: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
    });
    res.json(chats);
});
const CreateDirectSchema = zod_1.z.object({
    userId: zod_1.z.string(),
});
router.post('/direct', async (req, res) => {
    const parse = CreateDirectSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid input' });
    const userId = req.user.userId;
    const otherId = parse.data.userId;
    if (userId === otherId)
        return res.status(400).json({ error: 'Cannot chat with yourself' });
    const existing = await prisma_1.prisma.chat.findFirst({
        where: {
            isGroup: false,
            members: { every: { userId: { in: [userId, otherId] } } },
        },
    });
    if (existing)
        return res.json(existing);
    const chat = await prisma_1.prisma.chat.create({
        data: {
            isGroup: false,
            members: { create: [{ userId }, { userId: otherId }] },
        },
        include: { members: true },
    });
    res.json(chat);
});
router.get('/:chatId/messages', async (req, res) => {
    const userId = req.user.userId;
    const { chatId } = req.params;
    const member = await prisma_1.prisma.chatMember.findFirst({ where: { chatId, userId } });
    if (!member)
        return res.status(403).json({ error: 'Not a member' });
    const messages = await prisma_1.prisma.message.findMany({
        where: { chatId },
        include: { sender: { select: { id: true, username: true } } },
        orderBy: { createdAt: 'asc' },
    });
    res.json(messages);
});
exports.default = router;
//# sourceMappingURL=chats.js.map