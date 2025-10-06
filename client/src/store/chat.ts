import { create } from 'zustand';
import { api } from '../lib/api';
import type { Socket } from 'socket.io-client';

export type Chat = {
  id: string;
  isGroup: boolean;
  name?: string | null;
  updatedAt: string;
  members: { user: { id: string; username: string } }[];
  messages: any[];
};

export type Message = {
  id: string;
  chatId: string;
  sender: { id: string; username: string };
  content: string;
  createdAt: string;
};

type ChatState = {
  chats: Chat[];
  activeChatId: string | null;
  messages: Record<string, Message[]>;
  socket: Socket | null;
  setSocket: (s: Socket | null) => void;
  loadChats: () => Promise<void>;
  openChat: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => void;
  addIncomingMessage: (message: Message) => void;
};

export const useChat = create<ChatState>((set, get) => ({
  chats: [],
  activeChatId: null,
  messages: {},
  socket: null,
  setSocket(socket) {
    set({ socket });
  },
  async loadChats() {
    const res = await api.get('/chats');
    set({ chats: res.data });
  },
  async openChat(chatId) {
    const res = await api.get(`/chats/${chatId}/messages`);
    set((state) => ({
      activeChatId: chatId,
      messages: { ...state.messages, [chatId]: res.data },
    }));
    get().socket?.emit('chat:join', chatId);
  },
  sendMessage(chatId, content) {
    get().socket?.emit('message:send', { chatId, content });
  },
  addIncomingMessage(message) {
    set((state) => ({
      messages: {
        ...state.messages,
        [message.chatId]: [...(state.messages[message.chatId] || []), message],
      },
      chats: state.chats.map((c) => (c.id === message.chatId ? { ...c, messages: [message], updatedAt: message.createdAt } : c)),
    }));
  },
}));
