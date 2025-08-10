import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { UserService } from "src/user/user.service";
import { PrismaModule } from "prisma/prisma.module";

@Module({
  controllers: [AuthController],
  providers: [UserService],
  imports: [PrismaModule]
})
export class AuthModule {}
