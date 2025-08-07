import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";

// NestJS 어플리케이션 진입점
// 진입점을 bootstrap이라고 하는 것이 관례
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
