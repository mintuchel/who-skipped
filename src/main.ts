import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// NestJS 어플리케이션 진입점
// 진입점을 bootstrap이라고 하는 것이 관례
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();