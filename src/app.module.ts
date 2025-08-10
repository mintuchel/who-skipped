import { GroupModule } from "./group/group.module";
import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
@Module({
  imports: [UserModule, AuthModule, GroupModule]
})
export class AppModule {}
