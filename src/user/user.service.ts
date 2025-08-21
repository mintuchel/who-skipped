import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { UserInfoResponse } from "./dto/response/user-info.dto";
import { UserGroupInfo } from "./dto/response/user-group-info.dto";
import { JwtPayload } from "src/auth/security/payload/jwt.payload";
import { UserStreakInfoResponse } from "./dto/response/user-streak-info.dto";
import { SubmissionModule } from "src/submission/submission.module";
import { SubmissionResult } from "@prisma/client";
import { UserAcceptedProblemTagsInfoResponse } from "./dto/response/user-accepted-problem-tags-info.dto";

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

  // 특정 유저 조회
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

  // 유저가 속한 그룹 조회
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

  // 특정 유저의 30일간의 제출내역 확인
  async getUserStreaks(payload: JwtPayload): Promise<UserStreakInfoResponse[]> {
    const userStreaks = await this.prisma.$queryRaw<
      { date: string; count: number }[]
    >`
      SELECT DATE_FORMAT(submittedAt, "%Y-%m-%d") AS date, COUNT(*) AS count
      FROM submissions
      WHERE name = ${payload.name}
      GROUP BY DATE_FORMAT(submittedAt, "%Y-%m-%d")
      ORDER BY date;
    `;

    console.log(userStreaks);

    // MEDIUM_INT 같은 특수 타입들은 매핑될때 BigInt로 매핑되어 Number로 형변환시켜주지 않으면 뒤에 n이 붙어나온다
    return userStreaks.map((streak) => ({
      submitDate: streak.date,
      submitCount: Number(streak.count)
    }));
  }

  // 특정 유저의 30일간의 맞은 문제 유형 확인
  async getUserAcceptedProblemTags(
    payload: JwtPayload
  ): Promise<UserAcceptedProblemTagsInfoResponse[]> {
    const userAcceptedProblemTags = await this.prisma.$queryRaw<
      {
        tag: string;
        count: number;
      }[]
    >`
      SELECT problem_tags.tag AS tag, COUNT(*) AS count
      FROM problems
      JOIN problem_tags
      ON problems.id = problem_tags.problemId
      WHERE problems.id IN (
        SELECT problemId
        FROM submissions
        WHERE name = ${payload.name} AND result = "ACCEPTED"
      )
      GROUP BY problem_tags.tag
    `;

    console.log(userAcceptedProblemTags);

    // MEDIUM_INT 같은 특수 타입들은 매핑될때 BigInt로 매핑되어 Number로 형변환시켜주지 않으면 뒤에 n이 붙어나온다
    return userAcceptedProblemTags.map((tagResults) => ({
      tag: tagResults.tag,
      count: Number(tagResults.count)
    }));
  }
}
