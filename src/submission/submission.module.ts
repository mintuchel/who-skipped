import { Module } from "@nestjs/common";
import { SubmissionService } from "./submission.service";
import { SubmissionController } from "./submission.controller";
import { PrismaModule } from "prisma/prisma.module";

@Module({
  providers: [SubmissionService],
  controllers: [SubmissionController],
  imports: [PrismaModule]
})
export class SubmissionModule {}
