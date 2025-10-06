"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.requireAuth);
router.get('/me', async (req, res) => {
    const me = await prisma_1.prisma.user.findUnique({ where: { id: req.user.userId }, select: { id: true, username: true } });
    res.json(me);
});
router.get('/search', async (req, res) => {
    const q = String(req.query.username || '').trim();
    if (!q)
        return res.json([]);
    const users = await prisma_1.prisma.user.findMany({
        where: { username: { contains: q } },
        select: { id: true, username: true },
        take: 20,
    });
    res.json(users);
});
exports.default = router;
//# sourceMappingURL=users.js.map