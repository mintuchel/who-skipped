import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { UserInfoResponse } from "./dto/response/user-info.dto";
import { UserGroupInfo } from "./dto/response/user-group-info.dto";
import { JwtPayload } from "src/auth/security/payload/jwt.payload";
import { UserHeatMapInfoResponse } from "./dto/response/user-heatmap-info.dto";
import { Prisma } from "@prisma/client";

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
      role: user.role,
      tier: user.tier,
      solvedCount: user.solvedCount,
      streaks: user.streaks,
      averageTries: user.averageTries.toNumber(),
      solvedProblemTags: user.solvedProblemTags as Prisma.JsonArray,
      joinedAt: user.joinedAt
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
      role: user.role,
      tier: user.tier,
      solvedCount: user.solvedCount,
      streaks: user.streaks,
      averageTries: user.averageTries.toNumber(),
      solvedProblemTags: user.solvedProblemTags as Prisma.JsonArray,
      joinedAt: user.joinedAt
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
  async getUserHeatMap(
    payload: JwtPayload
  ): Promise<UserHeatMapInfoResponse[]> {
    const userStreaks = await this.prisma.$queryRaw<
      { date: string; count: number }[]
    >`
      SELECT DATE_FORMAT(submittedAt, "%Y-%m-%d") AS date, COUNT(*) AS count
      FROM submissions
      WHERE name = ${payload.name}
      GROUP BY DATE_FORMAT(submittedAt, "%Y-%m-%d")
      ORDER BY date;
    `;

    // MEDIUM_INT 같은 특수 타입들은 매핑될때 BigInt로 매핑되어 Number로 형변환시켜주지 않으면 뒤에 n이 붙어나온다
    return userStreaks.map((streak) => ({
      submitDate: streak.date,
      submitCount: Number(streak.count)
    }));
  }

  // 여기서 Promise.all로 streaks, averageTries, solvedProblemTags 모두 계산해서 업데이트
  // 모두 순서가 상관없는 작업들이므로 동시에 병렬적으로 실행시키자
  async updateUserStatistics(name: string): Promise<void> {
    await Promise.all([
      this.updateUserAverageTries(name),
      this.updateUserSolvedProblemTags(name)
    ]);
  }

  // 1. 특정 사람이 맞춘 문제 번호만 구하기
  // 2. 해당 문제들의 제출 내역 갯수 구하기
  // 3. AVG 함수로 평균내기
  private async updateUserAverageTries(name: string): Promise<void> {
    // queryRaw의 결과는 배열이다.
    // AVG의 결과는 string으로 매핑된다.
    const averageTriesRecord = await this.prisma.$queryRaw<{
      average_tries: string;
    }>`
      SELECT AVG(temp.cnt) AS average_tries
      FROM (
        SELECT problemId, COUNT(*) AS cnt
        FROM submissions
        WHERE problemId IN (
          SELECT problemId
          FROM submissions
          WHERE name = ${name} AND result = "ACCEPTED"
        )
        GROUP BY problemId
      ) AS temp
    `;

    const averageTries = Number(averageTriesRecord[0].average_tries);

    await this.prisma.users.update({
      where: { name: name },
      data: {
        averageTries: averageTries
      }
    });
  }

  // 특정 유저의 30일간의 맞은 문제유형 분석
  private async updateUserSolvedProblemTags(name: string): Promise<void> {
    const userSolvedProblemTags = await this.prisma.$queryRaw<
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
        WHERE name = ${name} AND result = "ACCEPTED"
      )
      GROUP BY problem_tags.tag
    `;

    // MEDIUM_INT 같은 특수 타입들은 매핑될때 BigInt로 매핑되어 Number로 형변환시켜주지 않으면 뒤에 n이 붙어나온다
    const tags = userSolvedProblemTags.map((tagResults) => ({
      tag: tagResults.tag,
      count: Number(tagResults.count)
    }));

    const tagsAsJson = tags.reduce(
      (acc, cur) => {
        acc[cur.tag] = Number(cur.count);
        return acc;
      },
      {} as Record<string, number>
    );

    await this.prisma.users.update({
      where: { name: name },
      data: {
        solvedProblemTags: tagsAsJson
      }
    });
  }
}
