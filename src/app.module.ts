import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './application/auth/auth.module';
import { UserModule } from './application/user/user.module';
import { PrismaService } from './core/services/prisma.service';
import { LogModule } from './application/log/log.module';
import { LoggerMiddleware } from './application/log/middleware/log.middleware';
import { HomeModule } from './application/home/home.module';
import { ConfigModule } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/hbs.adapter';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'reyes.bins@ethereal.email',
          pass: 'jF6FkMdup69B8EZ6C9'
        }
      },
      defaults: {
        from: '"No Reply" <noreply@example.com>',
      },
      template: {
        dir: join(__dirname, '..', 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    AuthModule,
    UserModule,
    LogModule,
    HomeModule,
  ],
  controllers: [],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
