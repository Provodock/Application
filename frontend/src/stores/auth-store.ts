import { create } from 'zustand';
import { api } from '../utils/api';

type User = { id: string; email: string };

type AuthState = {
  token: string | null;
  user: User | null;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
};

const STORAGE_KEY = 'event_manager_token';
const USER_STORAGE_KEY = 'event_manager_user';

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  setToken: (token) => {
    set({ token });
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  },
  hydrate: () => {
    const token = localStorage.getItem(STORAGE_KEY);
    const userRaw = localStorage.getItem(USER_STORAGE_KEY);
    const user = userRaw ? (JSON.parse(userRaw) as User) : null;
    set({ token, user });
  },
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const user = res.data.user as User;
    get().setToken(res.data.accessToken);
    set({ user });
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },
  register: async (email, password) => {
    const res = await api.post('/auth/register', { email, password });
    const user = res.data.user as User;
    get().setToken(res.data.accessToken);
    set({ user });
    if (user) localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  },
  logout: () => {
    set({ token: null, user: null });
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },
}));

