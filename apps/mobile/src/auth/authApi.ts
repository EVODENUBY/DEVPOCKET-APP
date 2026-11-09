import { z } from 'zod';
import { apiBaseUrl } from '../api/health';

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.string().datetime(),
});

const sessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  user: userSchema,
});

export type AuthUser = z.infer<typeof userSchema>;
export type AuthSession = z.infer<typeof sessionSchema>;

export class AuthApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'AuthApiError';
  }
}

async function postJson(path: string, body: unknown): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
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
    throw new AuthApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined;
  }
  return response.json();
}

async function parseSession(response: unknown): Promise<AuthSession> {
  const parsed = sessionSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error(
      'The DevPocket API returned an unexpected authentication response.',
    );
  }
  return parsed.data;
}

export async function registerAccount(input: {
  email: string;
  name: string;
  password: string;
}): Promise<AuthSession> {
  return parseSession(await postJson('/auth/register', input));
}

export async function signIn(input: {
  email: string;
  password: string;
}): Promise<AuthSession> {
  return parseSession(await postJson('/auth/login', input));
}

export async function refreshSession(
  refreshToken: string,
): Promise<AuthSession> {
  return parseSession(await postJson('/auth/refresh', { refreshToken }));
}

export async function revokeSession(refreshToken: string): Promise<void> {
  await postJson('/auth/logout', { refreshToken });
}

export type OAuthProvider = 'github' | 'google';

export function oauthStartUrl(
  provider: OAuthProvider,
  redirectUri: string,
): string {
  return `${apiBaseUrl}/auth/oauth/${provider}/start?redirect=${encodeURIComponent(redirectUri)}`;
}

export async function exchangeOAuthCode(code: string): Promise<AuthSession> {
  return parseSession(await postJson('/auth/oauth/exchange', { code }));
}
