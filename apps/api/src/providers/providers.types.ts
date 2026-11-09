export type ProviderKey = 'github' | 'gitlab' | 'vercel' | 'render';

export type ProviderCategory = 'source-control' | 'deployments';

export type ProviderDefinition = {
  key: ProviderKey;
  label: string;
  category: ProviderCategory;
  repositoryAccess: boolean;
};

export const providerCatalog: readonly ProviderDefinition[] = [
  {
    key: 'github',
    label: 'GitHub',
    category: 'source-control',
    repositoryAccess: true,
  },
  {
    key: 'gitlab',
    label: 'GitLab',
    category: 'source-control',
    repositoryAccess: false,
  },
  {
    key: 'vercel',
    label: 'Vercel',
    category: 'deployments',
    repositoryAccess: false,
  },
  {
    key: 'render',
    label: 'Render',
    category: 'deployments',
    repositoryAccess: false,
  },
];

export type ProviderConnection = {
  key: ProviderKey;
  label: string;
  category: ProviderCategory;
  connected: boolean;
  connectedAt: string | null;
  scopes: string[];
  tokenStored: boolean;
  tokenStorageEnabled: boolean;
  repositoryAccess: boolean;
};

export type GithubRepository = {
  id: string;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  description: string | null;
  language: string | null;
  defaultBranch: string;
  openIssues: number;
  stars: number;
  updatedAt: string;
  url: string;
};

export type GithubRepositoriesResponse = {
  provider: 'github';
  fetchedAt: string;
  repositories: GithubRepository[];
};
