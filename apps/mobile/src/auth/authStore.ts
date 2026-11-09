import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'free' | 'pro';
};

type AuthState = {
  isAuthenticated: boolean | null;
  user: AuthUser | null;
  isHydrated: boolean;
  setSession: (user: AuthUser) => void;
  logout: () => void;
  hydrate: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], Pick<AuthState, 'user' | 'isAuthenticated'>>(
    (set) => ({
      isAuthenticated: null,
      user: null,
      isHydrated: false,
      setSession: (user) =>
        set({ isAuthenticated: true, user, isHydrated: true }),
      logout: () =>
        set({ isAuthenticated: false, user: null, isHydrated: true }),
      hydrate: async () => {
        await new Promise((resolve) => setTimeout(resolve, 900));
        set({ isHydrated: true });
      },
    }),
    {
      name: 'devpocket-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
