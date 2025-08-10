import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { PrismaModule } from "prisma/prisma.module";

// 내부적으로 다른 모듈을 사용할때는 imports에 명시한다
// PrismaClient(PrismaService)를 사용하기 위해서는 PrismaModule을 import 해야한다
@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [PrismaModule],
  // AuthService에서 UserService를 사용할 수 있게끔 exports에 선언해주기
  exports: [UserService]
})
export class UserModule {}
