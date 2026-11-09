import { useQuery } from '@tanstack/react-query';
import {
  fetchGithubRepositories,
  fetchProviderConnections,
} from '../api/providers';
import { useSessionStore } from '../auth/sessionStore';

function useAccessToken() {
  return useSessionStore((state) => state.accessToken);
}

export function useProviderConnections() {
  const accessToken = useAccessToken();
  const userId = useSessionStore((state) => state.user?.id);

  return useQuery({
    queryKey: ['providers', 'connections', userId],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Sign in to load provider connections.');
      }
      return fetchProviderConnections(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });
}

export function useGithubRepositories(enabled: boolean) {
  const accessToken = useAccessToken();
  const userId = useSessionStore((state) => state.user?.id);

  return useQuery({
    queryKey: ['providers', 'github', 'repositories', userId],
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Sign in to load GitHub repositories.');
      }
      return fetchGithubRepositories(accessToken, signal);
    },
    enabled: enabled && Boolean(accessToken),
    retry: false,
  });
}
