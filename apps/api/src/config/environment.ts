import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  HOST: z.string().min(1).default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('*'),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  OAUTH_CALLBACK_BASE_URL: z.string().url().default('http://localhost:3000'),
  OAUTH_MOBILE_REDIRECT_PREFIXES: z.string().default('devpocket://,exp://'),
  OAUTH_TOKEN_KEY: z.string().min(32).optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

export function getEnvironment(environment: NodeJS.ProcessEnv = process.env) {
  return environmentSchema.parse(environment);
}

export type Environment = z.infer<typeof environmentSchema>;
