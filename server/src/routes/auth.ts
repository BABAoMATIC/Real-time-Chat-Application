import { Router } from 'express';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ENV } from '../env';
import { z } from 'zod';

const router = Router();

const CredentialsSchema = z.object({
  username: z.string().min(3).max(32),
  password: z.string().min(6).max(128),
});

router.post('/register', async (req, res) => {
  const parse = CredentialsSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { username, password } = parse.data;
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return res.status(409).json({ error: 'Username taken' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { username, password: hashed } });
  return res.json({ id: user.id, username: user.username });
});

router.post('/login', async (req, res) => {
  const parse = CredentialsSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: 'Invalid input' });
  const { username, password } = parse.data;
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, username: user.username }, ENV.JWT_SECRET, { expiresIn: '7d' });
  return res.json({ token, user: { id: user.id, username: user.username } });
});

export default router;
