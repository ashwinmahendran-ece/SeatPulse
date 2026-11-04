import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: sessionStorage.getItem('seatpulse_jwt'),
  isAuthenticated: !!sessionStorage.getItem('seatpulse_jwt'),

  login: (token: string) => {
    sessionStorage.setItem('seatpulse_jwt', token);
    set({ token, isAuthenticated: true });
  },

  logout: () => {
    sessionStorage.removeItem('seatpulse_jwt');
    set({ token: null, isAuthenticated: false });
  },
}));