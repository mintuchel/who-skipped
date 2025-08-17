import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProblemService } from "./problem.service";
import { Problem, ProblemSchema } from "./problem.schema";
import { ProblemController } from "./problem.controller";
import { PrismaModule } from "prisma/prisma.module";

// Problem은 MongoDB에 존재
// Submissions에 등록된 ProblemId에 대한 정보를 가져오기 위해 Prisma 사용해야함
@Module({
  controllers: [ProblemController],
  providers: [ProblemService],
  imports: [
    // Problem에 대한 CRUD 작업 도와주는 Model 객체 생성해서 DI 컨테이너에 등록해줌
    MongooseModule.forFeature([{ name: Problem.name, schema: ProblemSchema }]),
    PrismaModule
  ],
  exports: [ProblemService]
})
export class ProblemModule {}
