import { z } from 'zod';
import { apiBaseUrl } from './health';

const providerKeySchema = z.enum(['github', 'gitlab', 'vercel', 'render']);

const providerConnectionSchema = z.object({
  key: providerKeySchema,
  label: z.string(),
  category: z.enum(['source-control', 'deployments']),
  connected: z.boolean(),
  connectedAt: z.string().nullable(),
  scopes: z.array(z.string()),
  tokenStored: z.boolean(),
  tokenStorageEnabled: z.boolean(),
  repositoryAccess: z.boolean(),
});

const connectionsResponseSchema = z.object({
  connections: z.array(providerConnectionSchema),
});

const githubRepositorySchema = z.object({
  id: z.string(),
  name: z.string(),
  fullName: z.string(),
  owner: z.string(),
  private: z.boolean(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  defaultBranch: z.string(),
  openIssues: z.number().int().nonnegative(),
  stars: z.number().int().nonnegative(),
  updatedAt: z.string(),
  url: z.string().url(),
});

const githubRepositoriesResponseSchema = z.object({
  provider: z.literal('github'),
  fetchedAt: z.string(),
  repositories: z.array(githubRepositorySchema),
});

export type ProviderKey = z.infer<typeof providerKeySchema>;
export type ProviderConnection = z.infer<typeof providerConnectionSchema>;
export type GithubRepository = z.infer<typeof githubRepositorySchema>;
export type GithubRepositoriesResponse = z.infer<
  typeof githubRepositoriesResponseSchema
>;

export class ProvidersApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ProvidersApiError';
  }
}

async function getJson(
  path: string,
  accessToken: string,
  signal?: AbortSignal,
): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    throw new Error(
      `Could not reach the DevPocket API at ${apiBaseUrl}. Check the server and network address.`,
    );
  }

  if (!response.ok) {
    let message = `Request failed (HTTP ${response.status}).`;
    try {
      const payload: unknown = await response.json();
      if (
        typeof payload === 'object' &&
        payload !== null &&
        'message' in payload &&
        typeof payload.message === 'string'
      ) {
        message = payload.message;
      }
    } catch {
      message = `Request failed (HTTP ${response.status}).`;
    }
    throw new ProvidersApiError(message, response.status);
  }

  return response.json();
}

export async function fetchProviderConnections(
  accessToken: string,
  signal?: AbortSignal,
): Promise<ProviderConnection[]> {
  const parsed = connectionsResponseSchema.safeParse(
    await getJson('/providers/connections', accessToken, signal),
  );
  if (!parsed.success) {
    throw new Error('The DevPocket API returned unexpected connection data.');
  }
  return parsed.data.connections;
}

export async function fetchGithubRepositories(
  accessToken: string,
  signal?: AbortSignal,
): Promise<GithubRepositoriesResponse> {
  const parsed = githubRepositoriesResponseSchema.safeParse(
    await getJson('/providers/github/repositories', accessToken, signal),
  );
  if (!parsed.success) {
    throw new Error('The DevPocket API returned unexpected repository data.');
  }
  return parsed.data;
}
