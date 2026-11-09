import { z } from 'zod';

export const apiBaseUrl = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'
).replace(/\/+$/, '');

const healthResponseSchema = z.object({
  status: z.literal('ok'),
  service: z.literal('devpocket-api'),
  timestamp: z.string().datetime(),
});

export type ApiHealth = z.infer<typeof healthResponseSchema>;

export class ApiNetworkError extends Error {
  constructor() {
    super(
      `Could not reach the DevPocket API at ${apiBaseUrl}. Check the server and network address.`,
    );
    this.name = 'ApiNetworkError';
  }
}

export async function fetchApiHealth(signal?: AbortSignal): Promise<ApiHealth> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/health`, {
      headers: { Accept: 'application/json' },
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error;
    }
    throw new ApiNetworkError();
  }

  if (!response.ok) {
    throw new Error(
      `DevPocket API health check failed (HTTP ${response.status}).`,
    );
  }

  const result = healthResponseSchema.safeParse(await response.json());
  if (!result.success) {
    throw new Error('DevPocket API returned an unexpected health response.');
  }
  return result.data;
}
