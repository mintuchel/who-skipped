import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { PrismaModule } from "prisma/prisma.module";

@Module({
  controllers: [UserController],
  providers: [UserService],
  // PrismaClient(PrismaService)를 사용하기 위해서는 PrismaModule을 import 해야한다
  imports: [PrismaModule]
})
export class UserModule {}
