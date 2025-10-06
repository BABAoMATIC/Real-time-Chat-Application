"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../env");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const CredentialsSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(32),
    password: zod_1.z.string().min(6).max(128),
});
router.post('/register', async (req, res) => {
    const parse = CredentialsSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid input' });
    const { username, password } = parse.data;
    const existing = await prisma_1.prisma.user.findUnique({ where: { username } });
    if (existing)
        return res.status(409).json({ error: 'Username taken' });
    const hashed = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.prisma.user.create({ data: { username, password: hashed } });
    return res.json({ id: user.id, username: user.username });
});
router.post('/login', async (req, res) => {
    const parse = CredentialsSchema.safeParse(req.body);
    if (!parse.success)
        return res.status(400).json({ error: 'Invalid input' });
    const { username, password } = parse.data;
    const user = await prisma_1.prisma.user.findUnique({ where: { username } });
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcryptjs_1.default.compare(password, user.password);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = jsonwebtoken_1.default.sign({ userId: user.id, username: user.username }, env_1.ENV.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, username: user.username } });
});
exports.default = router;
//# sourceMappingURL=auth.js.map