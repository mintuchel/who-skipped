import { SolvedAcTier } from "@prisma/client";

export interface ProblemInfo {
  id: number;
  title: string;
  tier: SolvedAcTier;
  tags: string[];
}
