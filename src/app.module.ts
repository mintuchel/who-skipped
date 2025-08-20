import { GroupModule } from "./group/group.module";
import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { ProblemModule } from "./problem/problem.module";
import { ConfigModule } from "@nestjs/config";
import { SubmissionModule } from "./submission/submission.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true
    }),
    UserModule,
    AuthModule,
    GroupModule,
    ProblemModule,
    SubmissionModule
  ]
})
export class AppModule {}
