import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { json, Request } from 'express';

interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: false,
  });

  app.setGlobalPrefix('api/v1/', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  app.use(
    json({
      verify: (req: RequestWithRawBody, res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 2200;
  const apiUrl = process.env.API_BASE_URL || `http://localhost:${port}`;

  const options = new DocumentBuilder()
    .setTitle('SpendNub API Service')
    .setDescription('SpendNub API Docs')
    .setVersion('1.0')
    .addServer(apiUrl, 'Current environment')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);
  await app.listen(port);
}
bootstrap();
