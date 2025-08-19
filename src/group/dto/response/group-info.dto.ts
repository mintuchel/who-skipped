export interface GroupInfoResponse {
  name: string;
  manager: string;
  description: string;
  createdAt: Date;
  members: Array<{ name: string; skippedCnt: number; joinedAt: Date }>;
}
