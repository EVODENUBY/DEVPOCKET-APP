import { z } from 'zod';
import {
  githubRepositorySchema,
  normalizeGithubRepository,
} from './github.resources';
import type { GithubRepository } from './providers.types';

const GITHUB_API_URL = 'https://api.github.com';
const REQUEST_TIMEOUT_MS = 10_000;

export class GithubRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'GithubRequestError';
  }
}

export async function fetchGithubRepositories(
  accessToken: string,
  limit: number,
): Promise<GithubRepository[]> {
  const query = new URLSearchParams({
    per_page: String(limit),
    sort: 'updated',
    direction: 'desc',
    affiliation: 'owner,collaborator,organization_member',
  });

  let response: Response;
  try {
    response = await fetch(`${GITHUB_API_URL}/user/repos?${query.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'DevPocket',
      },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new GithubRequestError(0, 'Could not reach GitHub.');
  }

  if (!response.ok) {
    throw new GithubRequestError(
      response.status,
      `GitHub repository request failed (HTTP ${response.status}).`,
    );
  }

  const payload: unknown = await response.json().catch(() => null);
  const parsed = z.array(githubRepositorySchema).safeParse(payload);
  if (!parsed.success) {
    throw new GithubRequestError(
      response.status,
      'GitHub returned unexpected repository data.',
    );
  }

  return parsed.data.map(normalizeGithubRepository);
}
