import { Module } from "@nestjs/common";
import { SubmissionService } from "./submission.service";
import { SubmissionController } from "./submission.controller";
import { PrismaModule } from "prisma/prisma.module";
import { ProblemModule } from "src/problem/problem.module";

@Module({
  providers: [SubmissionService],
  controllers: [SubmissionController],
  imports: [PrismaModule, ProblemModule],
  exports: [SubmissionService]
})
export class SubmissionModule {}
