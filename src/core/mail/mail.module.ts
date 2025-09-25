import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { join } from 'path';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const mailHost = configService.get<string>('mail.host');

        // Se não houver configuração de email, use configuração de desenvolvimento
        if (!mailHost || mailHost === 'your-ethereal-username') {
          console.warn(
            '⚠️  Email não configurado. Emails serão logados no console em desenvolvimento.',
          );
          return {
            transport: {
              streamTransport: true,
              newline: 'unix',
              buffer: true,
            },
            defaults: {
              from: 'noreply@nestboilerplate.com',
            },
            preview: true, // Abre preview no browser em desenvolvimento
          };
        }

        return {
          transport: {
            host: configService.get<string>('mail.host'),
            port: configService.get<number>('mail.port'),
            secure: configService.get<number>('mail.port') === 465,
            auth: {
              user: configService.get<string>('mail.user'),
              pass: configService.get<string>('mail.pass'),
            },
          },
          defaults: {
            from: `"No Reply" <${configService.get<string>('mail.from')}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
