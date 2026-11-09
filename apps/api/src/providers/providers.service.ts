import {
  BadGatewayException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { decryptSecret } from '../auth/oauth/oauth.crypto';
import { getEnvironment } from '../config/environment';
import { PrismaService } from '../prisma/prisma.service';
import { fetchGithubRepositories, GithubRequestError } from './github.client';
import {
  ProviderConnection,
  providerCatalog,
  type GithubRepositoriesResponse,
} from './providers.types';

function splitScopes(scope: string | null): string[] {
  return scope ? scope.split(/[\s,]+/).filter(Boolean) : [];
}

@Injectable()
export class ProvidersService {
  constructor(private readonly prisma: PrismaService) {}

  async listConnections(
    userId: string,
  ): Promise<{ connections: ProviderConnection[] }> {
    const accounts = await this.prisma.oAuthAccount.findMany({
      where: { userId },
      select: {
        provider: true,
        scope: true,
        createdAt: true,
        accessToken: true,
      },
    });
    const byProvider = new Map(
      accounts.map((account) => [account.provider, account]),
    );
    const tokenStorageEnabled = Boolean(getEnvironment().OAUTH_TOKEN_KEY);

    return {
      connections: providerCatalog.map((definition) => {
        const account = byProvider.get(definition.key);
        const connected = Boolean(account);
        const tokenStored = Boolean(account?.accessToken);
        return {
          key: definition.key,
          label: definition.label,
          category: definition.category,
          connected,
          connectedAt: account?.createdAt.toISOString() ?? null,
          scopes: splitScopes(account?.scope ?? null),
          tokenStored,
          tokenStorageEnabled,
          repositoryAccess:
            definition.key === 'github' && connected && tokenStored,
        };
      }),
    };
  }

  async listGithubRepositories(
    userId: string,
    limit: number,
  ): Promise<GithubRepositoriesResponse> {
    const account = await this.prisma.oAuthAccount.findFirst({
      where: { userId, provider: 'github' },
      orderBy: { updatedAt: 'desc' },
      select: { accessToken: true },
    });
    if (!account) {
      throw new NotFoundException(
        'GitHub is not connected. Sign in with GitHub to read repositories.',
      );
    }

    const environment = getEnvironment();
    if (!environment.OAUTH_TOKEN_KEY) {
      throw new ConflictException(
        'Provider token storage is not configured. Set OAUTH_TOKEN_KEY on the API and reconnect GitHub.',
      );
    }
    if (!account.accessToken) {
      throw new ConflictException(
        'The GitHub connection has no stored token. Reconnect GitHub to grant repository access.',
      );
    }

    let accessToken: string;
    try {
      accessToken = decryptSecret(
        account.accessToken,
        environment.OAUTH_TOKEN_KEY,
      );
    } catch {
      throw new ConflictException(
        'The stored GitHub token could not be read. Reconnect GitHub.',
      );
    }

    try {
      const repositories = await fetchGithubRepositories(accessToken, limit);
      return {
        provider: 'github',
        fetchedAt: new Date().toISOString(),
        repositories,
      };
    } catch (error) {
      if (error instanceof GithubRequestError) {
        if (error.status === 401 || error.status === 403) {
          throw new ConflictException(
            'GitHub rejected the stored token or repository scope. Reconnect GitHub and approve repository access.',
          );
        }
        throw new BadGatewayException(error.message);
      }
      throw new BadGatewayException('Could not read repositories from GitHub.');
    }
  }
}
