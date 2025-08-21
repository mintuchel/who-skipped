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
}
