import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { UserInfoResponse } from "./dto/response/user-info.dto";
import { UserGroupInfo } from "./dto/response/user-group-info.dto";
import { JwtPayload } from "src/auth/security/payload/jwt.payload";
import { UserHeatMapInfoResponse } from "./dto/response/user-heatmap-info.dto";
import { Badge, Prisma } from "@prisma/client";
import { UserSolvedProblemTagsInfoResponse } from "./dto/response/user-solved-problem-tags-info.dto";

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

  async getUserSolvedProblemTags(
    name: string
  ): Promise<UserSolvedProblemTagsInfoResponse[]> {
    const solvedProblemTagsRecord = await this.prisma.users.findUnique({
      where: { name: name },
      select: {
        solvedProblemTags: true
      }
    });

    // TypeScript는 JSON 타입 지원을 안해서 JSON 타입은 Object로 온다
    // 따라서 as Record<string, number>를 통해 JSON 형태로 만들어 참조해야한다
    const tags = solvedProblemTagsRecord?.solvedProblemTags as Record<
      string,
      number
    >;

    return Object.entries(tags).map(([tag, count]) => ({
      tag,
      count
    }));
  }

  async getUserBadges(name: string): Promise<Badge[]> {
    const userBadgesRecord = await this.prisma.userBadges.findMany({
      where: { name: name },
      select: { badge: true }
    });

    const userBadges = userBadgesRecord.map((record) => record.badge);

    return userBadges;
  }

  // 여기서 Promise.all로 streaks, averageTries, solvedProblemTags 모두 계산해서 업데이트
  // 모두 순서가 상관없는 작업들이므로 동시에 병렬적으로 실행시키자
  async updateUserStatistics(name: string): Promise<void> {
    await Promise.all([
      this.updateUserAverageTries(name),
      this.updateUserSolvedProblemTags(name)
    ]);
    await this.updateUserBadges(name);
  }

  async updateUserBadges(name: string): Promise<void> {
    const badgeUnlockThreshold = 5;

    const user = await this.prisma.users.findUnique({
      where: { name: name }
    });

    if (!user) {
      throw new NotFoundException(name + " 사용자를 찾을 수 없습니다");
    }

    const tags = user.solvedProblemTags as Record<string, number>;

    if (
      tags["깊이 우선 탐색"] + tags["너비 우선 탐색"] >=
      badgeUnlockThreshold
    ) {
      await this.prisma.userBadges.create({
        data: {
          name: name,
          badge: Badge.MAZE_RUNNER
        }
      });
    }
    if (tags["수학"] >= badgeUnlockThreshold) {
      await this.prisma.userBadges.create({
        data: {
          name: name,
          badge: Badge.ARCHIMEDES
        }
      });
    }
    if (tags["백트래킹"] >= badgeUnlockThreshold) {
      await this.prisma.userBadges.create({
        data: {
          name: name,
          badge: Badge.HANZEL_AND_GRETEL
        }
      });
    }
    if (tags["브루트포스 알고리즘"] >= badgeUnlockThreshold) {
      await this.prisma.userBadges.create({
        data: {
          name: name,
          badge: Badge.HEAD_FIRST
        }
      });
    }
    if (tags["구현"] >= badgeUnlockThreshold) {
      await this.prisma.userBadges.create({
        data: {
          name: name,
          badge: Badge.ZERO_TO_HERO
        }
      });
    }
    if (tags["문자열"] >= badgeUnlockThreshold) {
      await this.prisma.userBadges.create({
        data: {
          name: name,
          badge: Badge.SHAEKSPEARE
        }
      });
    }
    if (tags["이분 탐색"] >= badgeUnlockThreshold) {
      await this.prisma.userBadges.create({
        data: {
          name: name,
          badge: Badge.RIGHT_OR_LEFT
        }
      });
    }
    if (tags["다이나믹 프로그래밍"] >= badgeUnlockThreshold) {
      await this.prisma.userBadges.create({
        data: {
          name: name,
          badge: Badge.OPTIMIZER
        }
      });
    }

    // 시간초과 갯수 조회
    const timeLimtCount = await this.prisma.$queryRaw<{
      time_limit_count: number;
    }>`
      SELECT COUNT(*) AS cnt
      FROM submissions
      WHERE name = ${name} AND result = "TIME_LIMIT"
    `;

    if (timeLimtCount.time_limit_count >= 10) {
      await this.prisma.userBadges.create({
        data: {
          name: name,
          badge: Badge.TIME_KEEPER
        }
      });
    }

    const solvedProblemCount = await this.prisma.$queryRaw<{
      solved_problem_count: number;
    }>`
      SELECT COUNT(*) AS cnt
      FROM submissions
      WHERE name = ${name}
    `;

    if (solvedProblemCount.solved_problem_count >= 30) {
      await this.prisma.userBadges.create({
        data: {
          name: name,
          badge: Badge.PRO_FINESSE
        }
      });
    }

    const submissionDateCount = await this.prisma.$queryRaw<{
      submission_date_count: number;
    }>`
      SELECT COUNT(*) AS cnt
      FROM submissions
      WHERE name = ${name}
      GROUP BY DATE(submittedAt)
    `;

    if (submissionDateCount.submission_date_count >= 10) {
      await this.prisma.userBadges.create({
        data: {
          name: name,
          badge: Badge.HARD_WORKER
        }
      });
    }

    if (Number(user.averageTries) < 2) {
      await this.prisma.userBadges.create({
        data: {
          name: name,
          badge: Badge.ONE_SHOT_ONE_KILL
        }
      });
    }
  }

  // 1. 특정 사람이 맞춘 문제 번호만 구하기
  // 2. 해당 문제들의 제출 내역 갯수 구하기
  // 3. AVG 함수로 평균내기
  private async updateUserAverageTries(name: string): Promise<void> {
    await this.prisma.$executeRaw`
      UPDATE users
      SET averageTries  = (
        SELECT AVG(temp.cnt)
        FROM (
          SELECT problemId, COUNT(*) AS cnt
          FROM submissions
          WHERE problemId IN (
            SELECT problemId
            FROM submissions
            WHERE name = ${name} AND result = "ACCEPTED"
          ) AND result != "ACCEPTED"
          GROUP BY problemId
        ) AS temp
      )
      WHERE name = ${name}
    `;
  }

  // 특정 유저의 30일간의 맞은 문제유형 분석
  // 현재 방식은 서버 -> DB 간의 네트워크 비용이 2번 듬
  // 그리고 prisma orm 인터페이스를 통해 update 구문까지 실행하니 추가적인 오버헤드 발생
  // 프로시져로 그냥 1번의 DB 연결로 계산할 수 있게 해보자
  private async updateUserSolvedProblemTags(name: string): Promise<void> {
    await this.prisma.$executeRaw`
        UPDATE users
        SET solvedProblemTags = (
          SELECT JSON_OBJECTAGG(tag, count)
          FROM (
            SELECT problem_tags.tag AS tag, COUNT(*) AS count
            FROM problems
            JOIN problem_tags ON problems.id = problem_tags.problemId
            WHERE problems.id IN (
              SELECT problemId
              FROM submissions
              WHERE name = ${name} AND result = "ACCEPTED"
            )
            GROUP BY problem_tags.tag
          ) AS temp
        )
        WHERE name = ${name}
      `;
  }
}
