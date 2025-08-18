import { SubmissionResult } from "@prisma/client";

export interface SubmissionInfoResponse {
  solutionId: number;
  name: string;
  problemId: number;
  result: SubmissionResult;
  memory: number;
  time: number;
  language: string;
  codeLength: number;
  submittedAt: Date;
}
