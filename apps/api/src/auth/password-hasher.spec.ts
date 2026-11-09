import { hashPassword, verifyPassword } from './password-hasher';

describe('password hashing', () => {
  it('creates a salted scrypt hash and verifies the password', async () => {
    const firstHash = await hashPassword('a-long-example-password');
    const secondHash = await hashPassword('a-long-example-password');

    expect(firstHash).not.toBe(secondHash);
    await expect(
      verifyPassword('a-long-example-password', firstHash),
    ).resolves.toBe(true);
    await expect(
      verifyPassword('a-different-password', firstHash),
    ).resolves.toBe(false);
  });

  it('rejects malformed or unsupported hash encodings', async () => {
    await expect(
      verifyPassword('a-long-example-password', 'not-a-hash'),
    ).resolves.toBe(false);
  });
});
