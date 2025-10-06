# Realtime Chat Messenger (WhatsApp-like)

This monorepo contains a TypeScript/React client and an Express/Socket.IO server with Prisma (SQLite) for a realtime chat experience.

## Prerequisites
- Node.js 18+

## Quick Start

### 1) Server
```bash
cd server
cp .env .env.local 2>/dev/null || true # optional
# Ensure .env has:
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="dev_secret_change_me"
# PORT=4000
# CLIENT_ORIGIN="http://localhost:5173"

npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
Server runs on `http://localhost:4000`.

### 2) Client
```bash
cd client
npm install
# Optionally set API base
# echo "VITE_API_BASE=http://localhost:4000" > .env
npm run dev
```
Client runs on `http://localhost:5173`.

## Features
- JWT auth (register/login)
- Direct chats
- Realtime messaging via Socket.IO
- Recent chats list with last message
- Typing events scaffolded on server

## API (selected)
- POST `/api/auth/register` { username, password }
- POST `/api/auth/login` { username, password } -> { token, user }
- GET `/api/users/me` (auth)
- GET `/api/users/search?username=...` (auth)
- GET `/api/chats` (auth)
- POST `/api/chats/direct` { userId } (auth)
- GET `/api/chats/:chatId/messages` (auth)

## Socket events
- Client emits:
  - `chat:join` chatId
  - `message:send` { chatId, content }
- Server emits:
  - `message:new` Message
  - `chat:updated` { chatId }
  - `typing` { chatId, userId, typing }

## Notes
- This is a minimal reference; extend with message status, file uploads, read receipts, and groups.
