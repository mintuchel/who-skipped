import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaModule } from "prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./security/strategy/jwt.strategy";
import { LocalStrategy } from "./security/strategy/local.strategy";
import { JwtAuthGuard } from "./security/guard/jwt.guard";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SubmissionModule } from "src/submission/submission.module";

@Module({
  controllers: [AuthController],
  // 의존성 주입되어야하는 것들
  providers: [AuthService, JwtStrategy, LocalStrategy, JwtAuthGuard],
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("JWT_SECRET"),
        signOptions: { expiresIn: "12h" }
      })
    }),
    PassportModule,
    SubmissionModule
  ],
  // 타 모듈에서도 UseGuard를 통해 JwtAuthGuard를 사용하기 위해 export 처리
  exports: [JwtAuthGuard]
})
export class AuthModule {}
