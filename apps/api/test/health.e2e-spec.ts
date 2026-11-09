import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Health endpoints', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DATABASE_URL ??=
      'postgresql://devpocket:devpocket@localhost:5432/devpocket?schema=public';
    process.env.JWT_ACCESS_SECRET ??=
      'test-only-secret-that-is-long-enough-for-jwt-signing';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({ isReady: jest.fn().mockResolvedValue(false) })
      .compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('reports process health without exposing configuration', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);

    expect(response.body).toEqual({
      status: 'ok',
      service: 'devpocket-api',
      timestamp: expect.any(String),
    });
    expect(response.body).not.toHaveProperty('databaseUrl');
  });

  it('does not claim readiness before the database is configured', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(503);

    expect(response.body).toMatchObject({
      statusCode: 503,
      message: 'Service Unavailable',
      reason: 'database_unavailable',
      status: 'not_ready',
    });
  });
});
