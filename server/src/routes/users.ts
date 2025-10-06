import { Router } from 'express';
import { prisma } from '../prisma';
import { requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/me', async (req: AuthedRequest, res) => {
  const me = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { id: true, username: true } });
  res.json(me);
});

router.get('/search', async (req, res) => {
  const q = String(req.query.username || '').trim();
  if (!q) return res.json([]);
  const users = await prisma.user.findMany({
    where: { username: { contains: q } },
    select: { id: true, username: true },
    take: 20,
  });
  res.json(users);
});

export default router;
