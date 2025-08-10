import { Module } from "@nestjs/common";
import { GroupController } from "./group.controller";
import { GroupService } from "./group.service";
import { PrismaModule } from "prisma/prisma.module";

@Module({
  controllers: [GroupController],
  providers: [GroupService],
  imports: [PrismaModule]
})
export class GroupModule {}
