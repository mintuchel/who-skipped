import { ProblemTier } from "@prisma/client";

export interface ProblemInfoResponse {
  problemId: number;
  title: string;
  tier: ProblemTier;
  tags: string[];
}
