import { Body, Controller, Injectable, Get, Param } from "@nestjs/common";
import { ProblemService } from "./problem.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Problem } from "./problem.schema";

@ApiTags("Problem")
@Controller("problems")
export class ProblemController {
  constructor(private readonly problemService: ProblemService) {}

  @Get("")
  @ApiOperation({ summary: "문제 전체 조회" })
  async getAllProblems(): Promise<Problem[]> {
    return await this.problemService.findAll();
  }

  @Get("/:problemId")
  @ApiOperation({ summary: "특정 문제 조회" })
  async getProblem(@Param("problemId") problemId: number): Promise<Problem> {
    return await this.problemService.findOne(problemId);
  }
}
