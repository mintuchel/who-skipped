import { Module } from "@nestjs/common";
import { PrismaService } from "./prisma.service";

// PrismaModule을 import 하는 모듈들은
// 이제 의존성 주입을 통해 PrismaService를 사용할 수 있다
@Module({
  providers: [PrismaService],
  exports: [PrismaService]
})
export class PrismaModule {}
