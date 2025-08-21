import { Controller, Get, Post, Delete } from "@nestjs/common";
import { SubmissionService } from "./submission.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { SubmissionInfoResponse } from "./dto/response/submission-info.dto";

@ApiTags("Submissions")
@Controller("/submissions")
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get()
  @ApiOperation({ summary: "전체 제출내역 조회" })
  async getAllSubmissions(): Promise<SubmissionInfoResponse[]> {
    return await this.submissionService.getAllSubmissions();
  }

  // 오늘 제출한거 추가하고
  // 30일전 제출한거 삭제
  @Delete()
  @ApiOperation({ summary: "전체 제출내역 업데이트" })
  async deleteSubmissions() {
    return await this.submissionService.deleteSubmissions();
  }
}
