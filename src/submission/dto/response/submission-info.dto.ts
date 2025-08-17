import { SubmissionResult } from "@prisma/client";

export interface SubmissionInfoResponse {
  // bigint 값을 stringfy해서 못넘기기 때문에 string으로 바꿔줘야함
  solutionId: string;
  name: string;
  problemId: number;
  result: SubmissionResult;
  memory: number;
  time: number;
  language: string;
  codeLength: number;
  submittedAt: Date;
}
