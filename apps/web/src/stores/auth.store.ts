import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearStoredAuth, persistTokens } from '../lib/auth-storage';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthState {
  user: User | null;
  hasHydrated: boolean;
  markHydrated: () => void;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,
      markHydrated: () => set({ hasHydrated: true }),
      setAuth: (user, accessToken, refreshToken) => {
        persistTokens(accessToken, refreshToken);
        set({ user });
      },
      logout: () => {
        clearStoredAuth();
        set({ user: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    }
  )
);
