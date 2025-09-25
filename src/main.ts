import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';
import * as compression from 'compression';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const port = process.env.PORT ?? 3099;
  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Configuração de versionamento de API
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  // Configurações de segurança
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            'https://fonts.googleapis.com',
            'https://cdn.jsdelivr.net',
          ],
          fontSrc: [
            "'self'",
            'https://fonts.gstatic.com',
            'https://fonts.scalar.com',
          ],
          imgSrc: ["'self'", 'data:', 'https:'],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
          connectSrc: ["'self'"],
          workerSrc: ["'self'", 'blob:'],
          childSrc: ["'self'", 'blob:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // Configuração de CORS
  app.enableCors({
    origin: isDevelopment
      ? [
          'http://localhost:3000',
          'http://localhost:3099',
          'http://localhost:5173',
        ]
      : process.env.ALLOWED_ORIGINS?.split(',') || false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: !isDevelopment,
    }),
  );

  // Configuração do OpenAPI/Scalar
  const config = new DocumentBuilder()
    .setTitle('NestJS Boilerplate API')
    .setDescription(
      `
      API robusta e escalável construída com NestJS, implementando:
      
      🔐 **Segurança:**
      - Autenticação JWT com refresh tokens
      - Sistema de roles hierárquico (CLIENTE → FUNCIONARIO → GERENTE → ADMIN → SUPERADMIN)
      - Rate limiting e proteção contra força bruta
      - Validação automática de entrada
      
      📊 **Funcionalidades:**
      - Gestão completa de usuários
      - Sistema de logs estruturado
      - Notificações por email
      - Documentação interativa
      
      🚀 **Tecnologias:**
      - NestJS + TypeScript
      - Prisma ORM + PostgreSQL
      - JWT + Passport
      - Nodemailer + Handlebars
      
      📋 **Versionamento:**
      - Versão atual: v1 (padrão)
      - Formato de URL: /v{version}/endpoint
      - Backward compatibility mantida
      - Deprecação gradual de versões antigas
    `,
    )
    .setVersion('1.0.0')
    .setContact(
      'Equipe de Desenvolvimento',
      'https://github.com/seu-usuario/nest-boilerplate',
      'dev@empresa.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT obtido através do endpoint de login',
        in: 'header',
      },
      'JWT-auth', // Nome da referência de segurança
    )
    .addServer(
      isDevelopment
        ? 'http://localhost:3099'
        : process.env.API_URL || 'https://api.empresa.com',
      isDevelopment ? 'Servidor de Desenvolvimento' : 'Servidor de Produção',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // Configuração do Scalar para documentação interativa
  app.use(
    '/docs',
    apiReference({
      spec: {
        content: document,
      },
      configuration: {
        title: 'NestJS Boilerplate API - Documentação',
        theme: 'purple',
        layout: 'modern',
        defaultHttpClient: {
          targetKey: 'javascript',
          clientKey: 'fetch',
        },
        authentication: {
          preferredSecurityScheme: 'JWT-auth',
          apiKey: {
            token: 'Bearer seu-jwt-token-aqui',
          },
        },
        customCss: `
          .scalar-app {
            --scalar-color-1: #2d1b69;
            --scalar-color-2: #553c9a;
            --scalar-color-3: #8b5cf6;
          }
        `,
      },
    }),
  );

  if (isDevelopment) {
    app.use('/docs-json', (req: Request, res: Response) => {
      res.json(document);
    });
  }

  await app.listen(port);

  Logger.log(`🚀 Aplicação rodando em: http://localhost:${port}`);
  Logger.log(`📚 Documentação Scalar: http://localhost:${port}/docs`);
  if (isDevelopment) {
    Logger.log(`📄 OpenAPI JSON: http://localhost:${port}/docs-json`);
  }
  Logger.log(`🔒 Ambiente: ${isDevelopment ? 'Desenvolvimento' : 'Produção'}`);
}

bootstrap().catch((error: unknown) => {
  Logger.error('❌ Erro ao inicializar a aplicação:', error);
  process.exit(1);
});
