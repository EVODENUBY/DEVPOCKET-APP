import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { z } from 'zod';
import { Environment, getEnvironment } from '../../config/environment';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth.service';
import { hashPassword } from '../password-hasher';
import {
  isOAuthProviderKey,
  OAuthProviderConfig,
  OAuthProviderKey,
  oauthProviders,
} from './oauth.config';
import {
  createPkcePair,
  encryptSecret,
  randomToken,
  sha256,
} from './oauth.crypto';

const STATE_TTL_MS = 10 * 60 * 1000;
const LOGIN_CODE_TTL_MS = 60 * 1000;
const PROVIDER_TIMEOUT_MS = 10_000;
const DEFAULT_MOBILE_REDIRECT = 'devpocket://oauth';

const tokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  expires_in: z.number().optional(),
});

const githubUserSchema = z.object({
  id: z.union([z.number(), z.string()]),
  login: z.string(),
  name: z.string().nullable().optional(),
});

const githubEmailSchema = z.object({
  email: z.string().email(),
  primary: z.boolean(),
  verified: z.boolean(),
});

const googleUserSchema = z.object({
  sub: z.string(),
  email: z.string().email(),
  email_verified: z.boolean().optional(),
  name: z.string().optional(),
});

type OAuthProfile = {
  providerAccountId: string;
  email: string;
  name: string;
};

type OAuthTokens = {
  accessToken: string;
  refreshToken?: string;
  scope?: string;
  expiresAt?: Date;
};

type ProviderCredentials = {
  config: OAuthProviderConfig;
  clientId: string;
  clientSecret: string;
};

function parseProviderPayload<T>(
  schema: z.ZodType<T>,
  payload: unknown,
  message: string,
): T {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new UnauthorizedException(message);
  }
  return parsed.data;
}

@Injectable()
export class OAuthService {
  private readonly logger = new Logger(OAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async start(provider: string, redirectTo?: string): Promise<string> {
    const environment = getEnvironment();
    const mobileRedirect = this.resolveMobileRedirect(redirectTo, environment);

    if (!isOAuthProviderKey(provider)) {
      return this.buildRedirect(mobileRedirect, {
        error: 'Unsupported sign-in provider.',
      });
    }

    const credentials = this.providerCredentials(provider, environment);
    if (!credentials) {
      return this.buildRedirect(mobileRedirect, {
        error: `${oauthProviders[provider].label} sign-in is not configured yet.`,
      });
    }

    const now = new Date();
    await this.prisma.oAuthState.deleteMany({
      where: { expiresAt: { lt: now } },
    });

    const state = randomToken(32);
    const { verifier, challenge } = createPkcePair();
    await this.prisma.oAuthState.create({
      data: {
        state,
        provider,
        codeVerifier: verifier,
        redirectTo: mobileRedirect,
        expiresAt: new Date(now.getTime() + STATE_TTL_MS),
      },
    });

    const params = new URLSearchParams({
      client_id: credentials.clientId,
      redirect_uri: this.callbackUrl(provider, environment),
      response_type: 'code',
      scope: credentials.config.scopes.join(' '),
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      ...credentials.config.extraAuthorizeParams,
    });

    return `${credentials.config.authorizeUrl}?${params.toString()}`;
  }

  async handleCallback(
    provider: string,
    input: { code?: string; state?: string; error?: string },
  ): Promise<string> {
    if (!isOAuthProviderKey(provider)) {
      throw new BadRequestException('Unsupported sign-in provider.');
    }

    const environment = getEnvironment();
    const storedState = input.state
      ? await this.prisma.oAuthState.findUnique({
          where: { state: input.state },
        })
      : null;
    const redirectTo =
      storedState?.redirectTo ??
      this.resolveMobileRedirect(undefined, environment);

    try {
      if (input.error) {
        throw new UnauthorizedException(
          `Provider authorization failed (${input.error}).`,
        );
      }
      if (
        !storedState ||
        storedState.provider !== provider ||
        storedState.expiresAt <= new Date()
      ) {
        throw new UnauthorizedException(
          'Sign-in request is invalid or expired.',
        );
      }
      if (!input.code) {
        throw new BadRequestException('Missing authorization code.');
      }

      await this.prisma.oAuthState.delete({ where: { id: storedState.id } });

      const credentials = this.providerCredentials(provider, environment);
      if (!credentials) {
        throw new UnauthorizedException(
          `${oauthProviders[provider].label} sign-in is not configured.`,
        );
      }

      const tokens = await this.exchangeCode(
        credentials,
        input.code,
        storedState.codeVerifier,
        this.callbackUrl(provider, environment),
      );
      const profile = await this.fetchProfile(provider, tokens.accessToken);
      const userId = await this.upsertUser(
        provider,
        profile,
        tokens,
        environment,
      );

      const loginCode = randomToken(32);
      await this.prisma.oAuthLoginCode.deleteMany({
        where: { userId, expiresAt: { lt: new Date() } },
      });
      await this.prisma.oAuthLoginCode.create({
        data: {
          codeHash: sha256(loginCode),
          userId,
          expiresAt: new Date(Date.now() + LOGIN_CODE_TTL_MS),
        },
      });

      return this.buildRedirect(redirectTo, { code: loginCode });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Sign-in failed.';
      this.logger.warn(`OAuth ${provider} callback failed: ${message}`);
      return this.buildRedirect(redirectTo, { error: message });
    }
  }

  async exchange(code: string) {
    const record = await this.prisma.oAuthLoginCode.findUnique({
      where: { codeHash: sha256(code) },
    });
    if (!record || record.expiresAt <= new Date()) {
      throw new UnauthorizedException('Sign-in code is invalid or expired.');
    }

    const consumed = await this.prisma.oAuthLoginCode.deleteMany({
      where: { id: record.id },
    });
    if (consumed.count !== 1) {
      throw new UnauthorizedException('Sign-in code is invalid or expired.');
    }

    return this.authService.startSessionForUser(record.userId);
  }

  private providerCredentials(
    provider: OAuthProviderKey,
    environment: Environment,
  ): ProviderCredentials | null {
    const clientId =
      provider === 'github'
        ? environment.GITHUB_CLIENT_ID
        : environment.GOOGLE_CLIENT_ID;
    const clientSecret =
      provider === 'github'
        ? environment.GITHUB_CLIENT_SECRET
        : environment.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return null;
    }
    return {
      config: oauthProviders[provider],
      clientId,
      clientSecret,
    };
  }

  private callbackUrl(provider: OAuthProviderKey, environment: Environment) {
    const base = environment.OAUTH_CALLBACK_BASE_URL.replace(/\/+$/, '');
    return `${base}/api/v1/auth/oauth/${provider}/callback`;
  }

  private resolveMobileRedirect(
    redirectTo: string | undefined,
    environment: Environment,
  ): string {
    if (!redirectTo) {
      return DEFAULT_MOBILE_REDIRECT;
    }
    const prefixes = environment.OAUTH_MOBILE_REDIRECT_PREFIXES.split(',')
      .map((prefix) => prefix.trim())
      .filter(Boolean);
    const allowed = prefixes.some((prefix) => redirectTo.startsWith(prefix));
    return allowed ? redirectTo : DEFAULT_MOBILE_REDIRECT;
  }

  private buildRedirect(base: string, params: Record<string, string>) {
    const separator = base.includes('?') ? '&' : '?';
    return `${base}${separator}${new URLSearchParams(params).toString()}`;
  }

  private async exchangeCode(
    credentials: ProviderCredentials,
    code: string,
    codeVerifier: string,
    redirectUri: string,
  ): Promise<OAuthTokens> {
    const body = new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      code_verifier: codeVerifier,
    });

    const response = await fetch(credentials.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },
      body,
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    });
    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok || (payload && this.hasErrorCode(payload))) {
      throw new UnauthorizedException(
        'Provider rejected the authorization code.',
      );
    }

    const tokens = parseProviderPayload(
      tokenResponseSchema,
      payload,
      'Provider returned an unexpected token response.',
    );

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      scope: tokens.scope,
      expiresAt: tokens.expires_in
        ? new Date(Date.now() + tokens.expires_in * 1000)
        : undefined,
    };
  }

  private hasErrorCode(payload: unknown): boolean {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      Boolean((payload as { error?: unknown }).error)
    );
  }

  private async fetchProfile(
    provider: OAuthProviderKey,
    accessToken: string,
  ): Promise<OAuthProfile> {
    if (provider === 'github') {
      return this.fetchGithubProfile(accessToken);
    }
    return this.fetchGoogleProfile(accessToken);
  }

  private async fetchGithubProfile(accessToken: string): Promise<OAuthProfile> {
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'DevPocket',
    };
    const [userResponse, emailResponse] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers,
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      }),
      fetch('https://api.github.com/user/emails', {
        headers,
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      }),
    ]);

    if (!userResponse.ok || !emailResponse.ok) {
      throw new UnauthorizedException('Could not read the GitHub profile.');
    }

    const user = parseProviderPayload(
      githubUserSchema,
      await userResponse.json(),
      'GitHub returned an unexpected profile.',
    );
    const emails = parseProviderPayload(
      z.array(githubEmailSchema),
      await emailResponse.json(),
      'GitHub returned unexpected email data.',
    );
    const verified =
      emails.find((entry) => entry.primary && entry.verified) ??
      emails.find((entry) => entry.verified);
    if (!verified) {
      throw new UnauthorizedException(
        'GitHub did not return a verified email address.',
      );
    }

    return {
      providerAccountId: String(user.id),
      email: verified.email.toLowerCase(),
      name: user.name?.trim() || user.login,
    };
  }

  private async fetchGoogleProfile(accessToken: string): Promise<OAuthProfile> {
    const response = await fetch(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
      },
    );
    if (!response.ok) {
      throw new UnauthorizedException('Could not read the Google profile.');
    }

    const profile = parseProviderPayload(
      googleUserSchema,
      await response.json(),
      'Google returned an unexpected profile.',
    );
    if (!profile.email_verified) {
      throw new UnauthorizedException(
        'Google did not return a verified email address.',
      );
    }

    return {
      providerAccountId: profile.sub,
      email: profile.email.toLowerCase(),
      name: profile.name?.trim() || profile.email.split('@')[0],
    };
  }

  private async upsertUser(
    provider: OAuthProviderKey,
    profile: OAuthProfile,
    tokens: OAuthTokens,
    environment: Environment,
  ): Promise<string> {
    const where = {
      provider_providerAccountId: {
        provider,
        providerAccountId: profile.providerAccountId,
      },
    };

    const existingAccount = await this.prisma.oAuthAccount.findUnique({
      where,
    });
    let user = existingAccount
      ? await this.prisma.user.findUnique({
          where: { id: existingAccount.userId },
        })
      : await this.prisma.user.findUnique({
          where: { email: profile.email },
        });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          passwordHash: await hashPassword(randomToken(32)),
        },
      });
    }

    const tokenData = this.encryptTokens(tokens, environment);
    await this.prisma.oAuthAccount.upsert({
      where,
      create: {
        provider,
        providerAccountId: profile.providerAccountId,
        userId: user.id,
        ...tokenData,
      },
      update: {
        userId: user.id,
        ...tokenData,
      },
    });

    return user.id;
  }

  private encryptTokens(tokens: OAuthTokens, environment: Environment) {
    if (!environment.OAUTH_TOKEN_KEY) {
      return {
        accessToken: null,
        refreshToken: null,
        scope: tokens.scope ?? null,
        expiresAt: tokens.expiresAt ?? null,
      };
    }

    return {
      accessToken: encryptSecret(
        tokens.accessToken,
        environment.OAUTH_TOKEN_KEY,
      ),
      refreshToken: tokens.refreshToken
        ? encryptSecret(tokens.refreshToken, environment.OAUTH_TOKEN_KEY)
        : null,
      scope: tokens.scope ?? null,
      expiresAt: tokens.expiresAt ?? null,
    };
  }
}
