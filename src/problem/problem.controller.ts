import { Controller, Get, Param } from "@nestjs/common";
import { ProblemService } from "./problem.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { ProblemInfoResponse } from "./dto/response/problem-info.dto";

@ApiTags("Problem")
@Controller("problems")
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get("")
  @ApiOperation({ summary: "전체 문제 조회" })
  async getAllProblems(): Promise<ProblemInfoResponse[]> {
    return await this.problemService.findAll();
  }

  @Get("/:problemId")
  @ApiOperation({ summary: "특정 문제 조회" })
  async getProblem(
    @Param("problemId") problemId: number
  ): Promise<ProblemInfoResponse> {
    return await this.problemService.findOne(problemId);
  }
}
