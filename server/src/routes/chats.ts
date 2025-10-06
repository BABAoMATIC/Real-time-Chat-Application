import { Router } from 'express';
import { prisma } from '../prisma';
import { AuthedRequest, requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const memberships = await prisma.chatMember.findMany({
    where: { userId },
    include: { chat: true },
    orderBy: { joinedAt: 'desc' },
  });
  const chats = await prisma.chat.findMany({
    where: { id: { in: memberships.map((m) => m.chatId) } },
    include: {
      members: { include: { user: { select: { id: true, username: true } } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1, include: { sender: { select: { id: true, username: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  });
  res.json(chats);
});

const CreateDirectSchema = z.object({
  userId: z.string(),
});

router.post('/direct', async (req: AuthedRequest, res) => {
  const parse = CreateDirectSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const userId = req.user!.userId;
  const otherId = parse.data.userId;
  if (userId === otherId) return res.status(400).json({ error: 'Cannot chat with yourself' });

  const existing = await prisma.chat.findFirst({
    where: {
      isGroup: false,
      members: { every: { userId: { in: [userId, otherId] } } },
    },
  });
  if (existing) return res.json(existing);

  const chat = await prisma.chat.create({
    data: {
      isGroup: false,
      members: { create: [{ userId }, { userId: otherId }] },
    },
    include: { members: true },
  });
  res.json(chat);
});

router.get('/:chatId/messages', async (req: AuthedRequest, res) => {
  const userId = req.user!.userId;
  const { chatId } = req.params as { chatId: string };
  const member = await prisma.chatMember.findFirst({ where: { chatId, userId } });
  if (!member) return res.status(403).json({ error: 'Not a member' });
  const messages = await prisma.message.findMany({
    where: { chatId },
    include: { sender: { select: { id: true, username: true } } },
    orderBy: { createdAt: 'asc' },
  });
  res.json(messages);
});

export default router;
