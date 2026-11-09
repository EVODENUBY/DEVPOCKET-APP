import { create } from 'zustand';
import type { AuthUser } from './authApi';

export type SessionStatus =
  'restoring' | 'authenticated' | 'unauthenticated' | 'error';

type SessionState = {
  status: SessionStatus;
  user: AuthUser | null;
  accessToken: string | null;
  error: string | null;
  setRestoring: () => void;
  setAuthenticated: (user: AuthUser, accessToken: string) => void;
  setUnauthenticated: () => void;
  setError: (message: string) => void;
};

export const useSessionStore = create<SessionState>((set) => ({
  status: 'restoring',
  user: null,
  accessToken: null,
  error: null,
  setRestoring: () => set({ status: 'restoring', error: null }),
  setAuthenticated: (user, accessToken) =>
    set({ status: 'authenticated', user, accessToken, error: null }),
  setUnauthenticated: () =>
    set({
      status: 'unauthenticated',
      user: null,
      accessToken: null,
      error: null,
    }),
  setError: (message) =>
    set({ status: 'error', user: null, accessToken: null, error: message }),
}));
