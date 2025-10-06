import { create } from 'zustand';
import { api, setAuthToken } from '../lib/api';

type User = { id: string; username: string };

type AuthState = {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  async login(username, password) {
    const res = await api.post('/auth/login', { username, password });
    const { token, user } = res.data;
    localStorage.setItem('token', token);
    setAuthToken(token);
    set({ user, token });
  },
  async register(username, password) {
    await api.post('/auth/register', { username, password });
    await get().login(username, password);
  },
  logout() {
    localStorage.removeItem('token');
    setAuthToken(null);
    set({ user: null, token: null });
  },
  async hydrate() {
    const token = localStorage.getItem('token');
    if (!token) return;
    setAuthToken(token);
    try {
      const res = await api.get('/users/me');
      set({ user: res.data, token });
    } catch {
      get().logout();
    }
  },
}));
