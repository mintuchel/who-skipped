import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

// NestJS 어플리케이션 진입점
// 진입점을 bootstrap이라고 하는 것이 관례
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Controller에서 받은 요청에 대한 유효성 검사를 하기 위한 전역적인 ValidationPipe 설정
  // ValidationPipe는 내부적으로 class-validator와 class-transformer를 함께 사용
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // class-transformer 활성화. JSON으로 들어온 Request Payload를 객체로 변환해주는 작업
      whitelist: true, // DTO에 정의되지 않은 속성있으면 제거
      forbidNonWhitelisted: true // DTO에 정의되지 않은 속성 있으면 예외(400 Bad Request) 발생. whitelist 기능을 켰을때만 작동한다.
    })
  );

  // Swagger Configs
  const config = new DocumentBuilder()
    .setTitle("Median")
    .setDescription("The Median API description")
    .setVersion("0.1")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
