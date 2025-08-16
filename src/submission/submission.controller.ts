import { Controller, Delete, Get } from "@nestjs/common";
import { SubmissionService } from "./submission.service";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Submissions")
@Controller("/submissions")
export class SubmissionController {
  constructor(private readonly submissionService: SubmissionService) {}

  @Get()
  @ApiOperation({ summary: "유저 제출내역 최신화" })
  async updateUserSubmissions() {
    return await this.submissionService.getUserSubmissions();
  }

  @Delete()
  @ApiOperation({ summary: "한 달 전 내역 삭제" })
  async deleteSubmissions() {
    return await this.submissionService.deleteSubmissions();
  }
}
