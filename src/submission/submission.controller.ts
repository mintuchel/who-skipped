import { Controller, Get } from "@nestjs/common";
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
}
