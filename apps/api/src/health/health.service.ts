import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'devpocket-api',
      timestamp: new Date().toISOString(),
    } as const;
  }

  async getReadiness() {
    const databaseReady = await this.prisma.isReady();
    if (!databaseReady) {
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: 'Service Unavailable',
        status: 'not_ready',
        reason: 'database_unavailable',
      });
    }

    return { status: 'ready' } as const;
  }
}
