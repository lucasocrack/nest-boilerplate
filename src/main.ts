import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { HbsAdapter } from '@nestjs-modules/mailer/dist/adapters/hbs.adapter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT ?? 3099;

  app.useStaticAssets(join(__dirname, '..', 'documentation'), {
    prefix: '/documentation',
  });

  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate')
    .setDescription('The NestJS Boilerplate API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.setViewEngine('hbs');
  app.setBaseViewsDir(join(__dirname, '..', 'templates'));


  await app.listen(port);
  Logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
