import { GroupModule } from "./group/group.module";
import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ProblemModule } from "./problem/problem.module";

@Module({
  imports: [
    UserModule,
    AuthModule,
    GroupModule,
    MongooseModule.forRoot(
      "mongodb+srv://mintuchel:1234@cluster0.nvc5lyb.mongodb.net/who_skipped?retryWrites=true&w=majority&appName=Cluster0"
    ),
    ProblemModule
  ]
})
export class AppModule {}
