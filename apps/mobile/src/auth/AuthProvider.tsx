import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from 'react';
import {
  AuthApiError,
  exchangeOAuthCode,
  oauthStartUrl,
  refreshSession,
  registerAccount,
  revokeSession,
  signIn,
  type AuthSession,
  type OAuthProvider,
} from './authApi';
import {
  deleteRefreshToken,
  getRefreshToken,
  saveRefreshToken,
} from './refreshTokenStorage';
import { useSessionStore } from './sessionStore';

WebBrowser.maybeCompleteAuthSession();

type AuthContextValue = {
  retryRestore: () => Promise<void>;
  register: typeof registerAccount;
  login: typeof signIn;
  loginWithProvider: (provider: OAuthProvider) => Promise<AuthSession | null>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const setRestoring = useSessionStore((state) => state.setRestoring);
  const setAuthenticated = useSessionStore((state) => state.setAuthenticated);
  const setUnauthenticated = useSessionStore(
    (state) => state.setUnauthenticated,
  );
  const setError = useSessionStore((state) => state.setError);

  const saveSession = useCallback(
    async (session: Awaited<ReturnType<typeof signIn>>) => {
      await saveRefreshToken(session.refreshToken);
      setAuthenticated(session.user, session.accessToken);
    },
    [setAuthenticated],
  );

  const retryRestore = useCallback(async () => {
    setRestoring();
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        setUnauthenticated();
        return;
      }

      const session = await refreshSession(refreshToken);
      await saveSession(session);
    } catch (error) {
      if (error instanceof AuthApiError && error.status === 401) {
        setUnauthenticated();
        try {
          await deleteRefreshToken();
        } catch {
          setError(
            'Your session expired, but its saved token could not be removed from this device.',
          );
        }
        return;
      }
      setError(
        error instanceof Error
          ? error.message
          : 'Could not restore your session.',
      );
    }
  }, [saveSession, setError, setRestoring, setUnauthenticated]);

  useEffect(() => {
    void retryRestore();
  }, [retryRestore]);

  const login = useCallback(
    async (input: Parameters<typeof signIn>[0]) => {
      const session = await signIn(input);
      await saveSession(session);
      return session;
    },
    [saveSession],
  );

  const register = useCallback(
    async (input: Parameters<typeof registerAccount>[0]) => {
      const session = await registerAccount(input);
      await saveSession(session);
      return session;
    },
    [saveSession],
  );

  const loginWithProvider = useCallback(
    async (provider: OAuthProvider): Promise<AuthSession | null> => {
      const redirectUri = Linking.createURL('oauth');
      const result = await WebBrowser.openAuthSessionAsync(
        oauthStartUrl(provider, redirectUri),
        redirectUri,
      );
      if (result.type !== 'success' || !result.url) {
        return null;
      }

      const { queryParams } = Linking.parse(result.url);
      const providerError = queryParams?.error;
      if (typeof providerError === 'string' && providerError) {
        throw new Error(providerError);
      }
      const code = queryParams?.code;
      if (typeof code !== 'string' || !code) {
        throw new Error('Sign-in did not return a code.');
      }

      const session = await exchangeOAuthCode(code);
      await saveSession(session);
      return session;
    },
    [saveSession],
  );

  const logout = useCallback(async () => {
    let refreshToken: string | null = null;
    let logoutError: string | null = null;
    try {
      refreshToken = await getRefreshToken();
    } catch {
      logoutError = 'Could not read the saved session from this device.';
    }

    try {
      if (refreshToken) {
        await revokeSession(refreshToken);
      }
    } catch (error) {
      logoutError =
        error instanceof Error
          ? `Signed out on this device, but the server could not revoke the session: ${error.message}`
          : 'Signed out on this device, but the server could not revoke the session.';
    }

    try {
      await deleteRefreshToken();
    } catch {
      logoutError =
        'Signed out in this app, but the saved session could not be removed from the device.';
    } finally {
      setUnauthenticated();
    }

    if (logoutError) {
      setError(logoutError);
    }
  }, [setError, setUnauthenticated]);

  return (
    <AuthContext.Provider
      value={{ retryRestore, register, login, loginWithProvider, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return value;
}
