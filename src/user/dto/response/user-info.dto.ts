import { Role, SolvedAcTier } from "@prisma/client";
import { Prisma } from "@prisma/client";

export interface UserInfoResponse {
  name: string;
  role: Role;
  tier: SolvedAcTier; // solvedAc 티어
  solvedCount: number; // 총 푼 백준 문제 수
  streaks: number; // 현재 스트릭
  averageTries: number; // 평균 시도 횟수 (TypeScript에서는 Number가 소수까지 표현가능함)
  solvedProblemTags: Prisma.JsonArray;
  joinedAt: Date; // 백준 시작 날짜
}
