import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ZodValidationPipe } from 'nestjs-zod';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Security Headers
  app.use(helmet());

  // Required to read the httpOnly accessToken/refreshToken cookies set by AuthController
  app.use(cookieParser());

  // CORS — must be a concrete origin (not '*') since credentials: true requires it
  app.enableCors({
    origin: configService.frontendUrl,
    credentials: true,
  });

  // Global Exception Filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global Zod Validation Pipe
  app.useGlobalPipes(new ZodValidationPipe());

  // Dev/staging only: the generated docs describe every route, DTO shape and
  // auth requirement in the API, which is a map worth handing to an attacker
  // but not to the public.
  const isProduction = configService.nodeEnv === 'production';
  if (!isProduction) {
    const config = new DocumentBuilder()
      .setTitle('Valiant API')
      .setDescription('The Valiant API description')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  const port = configService.port;
  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  if (!isProduction) {
    console.log(`📖 Swagger docs available at: http://localhost:${port}/api`);
  }
}

bootstrap();

