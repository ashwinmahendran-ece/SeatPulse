import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  username: string;
  role: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (token: string, user: AuthUser) => set({
        token,
        user,
        isAuthenticated: true
      }),

      logout: () => set({
        token: null,
        user: null,
        isAuthenticated: false
      }),
    }),
    {
      name: 'seatpulse-auth',
    }
  )
);