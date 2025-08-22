import { Role, SolvedAcTier } from "@prisma/client";

export interface UserInfoResponse {
  name: string;
  role: Role;
  streaks: number; // 현재 스트릭
  tier: SolvedAcTier; // solvedAc 티어
  averageTries: number; // 평균 시도 횟수 (TypeScript에서는 Number가 소수까지 표현가능함)
  joinedAt: Date; // 백준 시작 날짜
}
