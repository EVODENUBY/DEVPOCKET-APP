export type OAuthProviderKey = 'github' | 'google';

export type OAuthProviderConfig = {
  key: OAuthProviderKey;
  label: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  extraAuthorizeParams?: Record<string, string>;
};

export const oauthProviders: Record<OAuthProviderKey, OAuthProviderConfig> = {
  github: {
    key: 'github',
    label: 'GitHub',
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    scopes: ['read:user', 'user:email'],
  },
  google: {
    key: 'google',
    label: 'Google',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scopes: ['openid', 'email', 'profile'],
    extraAuthorizeParams: { access_type: 'offline', prompt: 'consent' },
  },
};

export function isOAuthProviderKey(value: string): value is OAuthProviderKey {
  return value === 'github' || value === 'google';
}
