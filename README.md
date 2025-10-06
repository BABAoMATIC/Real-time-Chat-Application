# Real-time Chat Messenger (WhatsApp-like)

This project includes a TypeScript Express + Socket.IO backend and a React + Vite frontend with realtime messaging, JWT auth, and SQLite (via Prisma).

## Requirements
- Node.js 18+

## Project Structure
- `server/`: Express API + Socket.IO + Prisma (SQLite)
- `client/`: React (Vite) app

## Setup

### 1) Server
```
cd server
cp .env .env.local 2>/dev/null || true
# Ensure .env contains:
# DATABASE_URL="file:./dev.db"
# JWT_SECRET="change_me"
# PORT=4000
# CLIENT_ORIGIN="http://localhost:5173"

npm install
npx prisma migrate dev --name init
npm run dev
```
Server runs at `http://localhost:4000`.

### 2) Client
```
cd client
npm install
# Create .env with backend URL if different:
# VITE_API_BASE=http://localhost:4000
npm run dev
```
Client runs at the printed Vite URL (default `http://localhost:5173`).

## Usage
1. Open the client, register a couple users (e.g., in two different browsers or private windows).
2. Use the left sidebar search to find another user and start a direct chat.
3. Open the chat and send messages; messages appear in realtime.

## Notes
- Auth is JWT-based; token is stored in `localStorage` client-side.
- Database is SQLite for local dev; you can switch to Postgres by updating `schema.prisma` datasource and `DATABASE_URL`.
- Socket events used:
  - `chat:join` — join a chat room
  - `message:send` — send message to chat
  - `message:new` — broadcast new message
  - `chat:updated` — notify chat list updates

## Scripts
- Backend:
  - `npm run dev` — start API + Socket.IO with ts-node-dev
  - `npm run build && npm start` — build and run compiled server
- Frontend:
  - `npm run dev` — start Vite dev server

## Future enhancements
- Typing indicators and presence
- Read receipts and message statuses
- Group management (add/remove members)
- Message attachments
