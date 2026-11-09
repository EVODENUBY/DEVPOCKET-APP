import {
  githubRepositorySchema,
  normalizeGithubRepository,
} from './github.resources';

const repositoryPayload = {
  id: 1296269,
  name: 'Hello-World',
  full_name: 'octocat/Hello-World',
  private: false,
  html_url: 'https://github.com/octocat/Hello-World',
  description: 'My first repository on GitHub!',
  language: 'TypeScript',
  default_branch: 'main',
  open_issues_count: 4,
  stargazers_count: 9000,
  updated_at: '2026-01-02T03:04:05Z',
  owner: { login: 'octocat' },
};

describe('github repository normalization', () => {
  it('maps GitHub fields to the API contract', () => {
    const parsed = githubRepositorySchema.parse(repositoryPayload);

    expect(normalizeGithubRepository(parsed)).toEqual({
      id: '1296269',
      name: 'Hello-World',
      fullName: 'octocat/Hello-World',
      owner: 'octocat',
      private: false,
      description: 'My first repository on GitHub!',
      language: 'TypeScript',
      defaultBranch: 'main',
      openIssues: 4,
      stars: 9000,
      updatedAt: '2026-01-02T03:04:05.000Z',
      url: 'https://github.com/octocat/Hello-World',
    });
  });

  it('defaults optional metrics and nullable fields', () => {
    const parsed = githubRepositorySchema.parse({
      ...repositoryPayload,
      description: null,
      language: null,
      open_issues_count: undefined,
      stargazers_count: undefined,
    });

    const normalized = normalizeGithubRepository(parsed);

    expect(normalized.description).toBeNull();
    expect(normalized.language).toBeNull();
    expect(normalized.openIssues).toBe(0);
    expect(normalized.stars).toBe(0);
  });

  it('rejects malformed repository payloads', () => {
    const parsed = githubRepositorySchema.safeParse({
      ...repositoryPayload,
      html_url: 'not-a-url',
      updated_at: 'yesterday',
    });

    expect(parsed.success).toBe(false);
  });
});
