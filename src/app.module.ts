import { GroupModule } from "./group/group.module";
import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ProblemModule } from "./problem/problem.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { SubmissionModule } from "./submission/submission.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("MONGODB_URL"),
        connectionFactory: (conn) => {
          conn.on("connected", () => {
            console.log("MongoDB connected");
          });
          conn.on("error", (err) => {
            console.error("MongoDB connection error:", err);
          });
          conn.on("disconnected", () => {
            console.warn("MongoDB disconnected");
          });
          return conn;
        }
      })
    }),
    UserModule,
    AuthModule,
    GroupModule,
    ProblemModule,
    SubmissionModule
  ]
})
export class AppModule {}
