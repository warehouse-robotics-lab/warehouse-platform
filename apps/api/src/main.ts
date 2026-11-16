import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableShutdownHooks();

  await app.listen(configService.getOrThrow<number>('PORT'));
}

bootstrap().catch((error: unknown) => {
  console.error('Не удалось запустить API', error);
  process.exit(1);
});
