import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3099;
  await app.listen(port);
  console.log(`API rodando em: http://localhost:${port}/`);
}
bootstrap();