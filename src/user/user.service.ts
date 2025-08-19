import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { UserInfoResponse } from "./dto/response/user-info.dto";
import { UserGroupInfo } from "./dto/response/user-group-info.dto";
import { JwtPayload } from "src/auth/security/payload/jwt.payload";
import { UserStreakInfoResponse } from "./dto/response/user-streak-info.dto";

@Injectable()
export class UserService {
  // 의존성 주입
  // 할당 이후 재할당 불가능하도록 readonly로 설정
  constructor(private readonly prisma: PrismaService) {}

  // 전체 유저 조회
  async getAllUsers(): Promise<UserInfoResponse[]> {
    const users = await this.prisma.users.findMany();

    return users.map((user) => ({
      name: user.name,
      skippedCnt: user.skippedCnt,
      role: user.role
    }));
  }

  async getUser(name: string): Promise<UserInfoResponse> {
    const user = await this.prisma.users.findUnique({
      where: { name: name }
    });

    if (!user) {
      throw new NotFoundException(name + " 사용자를 찾을 수 없습니다");
    }

    return {
      name: user.name,
      skippedCnt: user.skippedCnt,
      role: user.role
    };
  }

  async getUserGroups(payload: JwtPayload): Promise<UserGroupInfo[]> {
    // include가 join과 유사
    const userGroups = await this.prisma.groupMemberships.findMany({
      where: { userId: payload.id },
      include: { group: true }
    });

    return userGroups.map((group) => ({
      name: group.group.name,
      manager: group.group.managerName,
      joinedAt: group.joinedAt
    }));
  }

  // 한 달 간의 시도내역 조회
  async getUserStreaks(payload: JwtPayload): Promise<UserStreakInfoResponse[]> {
    const userStreaks = await this.prisma.submissions.groupBy({
      by: ["submittedAt"],
      where: {
        name: payload.name
      },
      _count: {
        submittedAt: true
      }
    });

    return userStreaks.map((streak) => ({
      submitDate: streak.submittedAt.toISOString().split("T")[0],
      submitCount: streak._count.submittedAt
    }));
  }
}
