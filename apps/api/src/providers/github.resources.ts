import { z } from 'zod';
import type { GithubRepository } from './providers.types';

export const githubRepositorySchema = z.object({
  id: z.number(),
  name: z.string().min(1),
  full_name: z.string().min(1),
  private: z.boolean(),
  html_url: z.string().url(),
  description: z.string().nullable().optional(),
  language: z.string().nullable().optional(),
  default_branch: z.string().min(1),
  open_issues_count: z.number().int().nonnegative().optional(),
  stargazers_count: z.number().int().nonnegative().optional(),
  updated_at: z.string().datetime(),
  owner: z.object({ login: z.string().min(1) }),
});

export type GithubRepositoryPayload = z.infer<typeof githubRepositorySchema>;

export function normalizeGithubRepository(
  repository: GithubRepositoryPayload,
): GithubRepository {
  return {
    id: String(repository.id),
    name: repository.name,
    fullName: repository.full_name,
    owner: repository.owner.login,
    private: repository.private,
    description: repository.description ?? null,
    language: repository.language ?? null,
    defaultBranch: repository.default_branch,
    openIssues: repository.open_issues_count ?? 0,
    stars: repository.stargazers_count ?? 0,
    updatedAt: new Date(repository.updated_at).toISOString(),
    url: repository.html_url,
  };
}
