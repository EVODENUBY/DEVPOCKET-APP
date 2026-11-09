import { createHash } from 'node:crypto';
import {
  createPkcePair,
  decryptSecret,
  encryptSecret,
  randomToken,
  sha256,
} from './oauth.crypto';

describe('oauth crypto helpers', () => {
  it('creates a valid S256 PKCE pair', () => {
    const { verifier, challenge } = createPkcePair();
    expect(verifier).toMatch(/^[A-Za-z0-9_-]{43,128}$/);
    expect(challenge).toBe(
      createHash('sha256').update(verifier).digest('base64url'),
    );
  });

  it('encrypts and decrypts provider tokens', () => {
    const secret = 'x'.repeat(32);
    const payload = encryptSecret('gho_secret_token', secret);

    expect(payload).not.toContain('gho_secret_token');
    expect(decryptSecret(payload, secret)).toBe('gho_secret_token');
  });

  it('rejects tampered or malformed payloads', () => {
    const secret = 'x'.repeat(32);
    const [iv, tag, data] = encryptSecret('token', secret).split('.');

    expect(() =>
      decryptSecret(`${iv}.${tag}.${data.slice(0, -1)}A`, secret),
    ).toThrow();
    expect(() => decryptSecret('not-encrypted', secret)).toThrow(
      'Malformed encrypted secret.',
    );
  });

  it('generates url-safe tokens and stable hashes', () => {
    const token = randomToken(32);
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(sha256(token)).toBe(sha256(token));
  });
});
