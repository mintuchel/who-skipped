import { Controller, Get, Post, Delete } from "@nestjs/common";
import { SubmissionService } from "./submission.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { SubmissionInfoResponse } from "./dto/response/submission-info.dto";

@ApiTags("Submissions")
@Controller("/submissions")
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get("/test")
  @ApiOperation({ summary: "전체 제출내역 조회" })
  async test(): Promise<any> {
    return await this.submissionService.test();
  }

  @Get()
  @ApiOperation({ summary: "전체 제출내역 조회" })
  async getAllSubmissions(): Promise<SubmissionInfoResponse[]> {
    return await this.submissionService.getAllSubmissions();
  }

  @Post()
  @ApiOperation({ summary: "전체 유저 제출내역 최신화" })
  async updateUserSubmissions() {
    return await this.submissionService.getUserSubmissions();
  }

  @Delete()
  @ApiOperation({ summary: "한 달 전 내역 삭제" })
  async deleteSubmissions() {
    return await this.submissionService.deleteSubmissions();
  }
}
