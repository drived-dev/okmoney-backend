import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { apiReference } from '@scalar/nestjs-api-reference';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const config = new DocumentBuilder()
    .setTitle('Okmoney API')
    .setDescription('The Okmoney API description')
    .setVersion('1.0')
    .addTag('okmoney')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const corsOptions: CorsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: [
      'X-CSRF-Token',
      'X-Requested-With',
      'Accept',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Content-Type',
      'Date',
      'X-Api-Version',
    ],
  };

  app.enableCors(corsOptions);

  // Apply session middleware globally
  app.use(
    session({
      secret: 'your_secret_key',  // Replace with a secure random key
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 3600000,  // Session duration in milliseconds (e.g., 1 hour)
      },
    }),
  );

  // Add the API reference route
  app.use('/reference', apiReference({
    spec: {
      content: document,
    },
  }));

  const port = process.env.PORT || 3000;
  await app.listen(port, () => {
    Logger.log('Listening at http://localhost:' + port + '/' + globalPrefix);
  });
}

bootstrap();
