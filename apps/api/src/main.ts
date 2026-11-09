import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { getEnvironment } from './config/environment';

async function bootstrap() {
  const environment = getEnvironment();
  if (
    environment.NODE_ENV === 'production' &&
    environment.CORS_ORIGIN === '*'
  ) {
    throw new Error('CORS_ORIGIN must be explicitly configured in production.');
  }
  const allowedOrigins =
    environment.CORS_ORIGIN === '*'
      ? '*'
      : environment.CORS_ORIGIN.split(',').map((origin) => origin.trim());
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.use(helmet());
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: allowedOrigins });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('DevPocket API')
    .setDescription('Versioned API for DevPocket mobile clients.')
    .setVersion('1.0')
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );

  await app.listen(environment.PORT, environment.HOST);
}

void bootstrap();
