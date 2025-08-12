import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaModule } from "prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./security/strategy/jwt.strategy";
import { LocalStrategy } from "./security/strategy/local.strategy";

@Module({
  controllers: [AuthController],
  // 의존성 주입되어야하는 것들
  providers: [AuthService, JwtStrategy, LocalStrategy],
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: "1h" }
    }),
    PassportModule
  ]
})
export class AuthModule {}
