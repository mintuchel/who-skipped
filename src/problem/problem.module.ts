import { Module } from "@nestjs/common";
import { ProblemService } from "./problem.service";
import { ProblemController } from "./problem.controller";
import { PrismaModule } from "prisma/prisma.module";
import { SolvedAcModule } from "src/solvedac/solvedac.module";

// Problem은 MongoDB에 존재
// Submissions에 등록된 ProblemId에 대한 정보를 가져오기 위해 Prisma 사용해야함
@Module({
  controllers: [ProblemController],
  providers: [ProblemService],
  imports: [PrismaModule, SolvedAcModule],
  exports: [ProblemService]
})
export class ProblemModule {}
