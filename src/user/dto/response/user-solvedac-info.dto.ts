import { SolvedAcTier } from "@prisma/client";

export interface UserSolvedacInfoResponse {
  tier: SolvedAcTier;
  solvedCount: number;
  joinedAt: string;
}
