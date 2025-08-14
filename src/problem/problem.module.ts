import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProblemService } from "./problem.service";
import { Problem, ProblemSchema } from "./problem.schema";
import { ProblemController } from "./problem.controller";

// Problem 모듈은 Prisma를 안쓰고 MongoDB만 사용해서
// MongoDB만 사용할 수 있으면 된다!
@Module({
  controllers: [ProblemController],
  providers: [ProblemService],
  imports: [
    // Problem에 대한 CRUD 작업 도와주는 Model 객체 생성해서 DI 컨테이너에 등록해줌
    MongooseModule.forFeature([{ name: Problem.name, schema: ProblemSchema }])
  ],
  exports: [ProblemService]
})
export class ProblemModule {}
