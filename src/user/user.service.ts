import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { UserInfoResponse } from "./dto/response/user-info.dto";
import { UserGroupInfo } from "./dto/response/user-group-info.dto";
import { JwtPayload } from "src/auth/security/payload/jwt.payload";
import puppeteer from "puppeteer-core";

export interface Submission {
  solutionId: string;
  problemId: string;
  result: string;
  memory: string;
  time: string;
  language: string;
  codeLength: string;
  submissionTime: string;
}

@Injectable()
export class UserService {
  // 의존성 주입
  // 할당 이후 재할당 불가능하도록 readonly로 설정
  constructor(private readonly prisma: PrismaService) {}

  // 전체 유저 조회
  async getAllUsers(): Promise<UserInfoResponse[]> {
    const users = await this.prisma.users.findMany();

    return users.map((user) => ({
      bojName: user.boj_name,
      skippedCnt: user.skipped_cnt,
      role: user.role
    }));
  }

  // password 정보 빼고만 보내주기
  async getUser(bojName: string): Promise<UserInfoResponse> {
    const user = await this.prisma.users.findUnique({
      where: { boj_name: bojName }
    });

    if (!user) {
      throw new NotFoundException(bojName + " 사용자를 찾을 수 없습니다");
    }

    return {
      bojName: user.boj_name,
      skippedCnt: user.skipped_cnt,
      role: user.role
    };
  }

  async getUserGroups(payload: JwtPayload): Promise<UserGroupInfo[]> {
    // include가 join과 유사
    const userGroups = await this.prisma.groupMembership.findMany({
      where: { userId: payload.id },
      include: { group: true }
    });

    return userGroups.map((group) => ({
      name: group.group.name,
      manager: group.group.managerName,
      joinedAt: group.joinedAt
    }));
  }

  async deleteUser(bojName: string) {
    // delete는 삭제된 레코드 전체를 반환
    return await this.prisma.users.delete({
      where: { boj_name: bojName }
    });
  }

  // puppeteer 사용해서 크롤링
  // 푼 문제에 대한 정보가 mongodb에 없으면 problemservice에서 문제 조회해서 mongodb에 저장
  async getUserSubmissions(payload: JwtPayload): Promise<Submission[]> {
    const userId = payload.boj_name;

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    });

    const page = await browser.newPage();

    await page.goto(
      `https://www.acmicpc.net/status?problem_id=&user_id=${userId}&language_id=-1&result_id=-1`,
      { waitUntil: "domcontentloaded" }
    );

    // puppeteer의 evaludate은 브라우저 안에서 코드를 실행하게 해주는 함수
    // html을 파싱하는 작업은 이 함수 안에서 해야함
    const submissions = await page.evaluate(() => {
      // 1. 모든 <tbody> 요소를 선택
      const tbodyElements = document.querySelectorAll("tbody");

      return Array.from(tbodyElements)
        .map((tbody) => {
          const rows = tbody.querySelectorAll("tr");
          return Array.from(rows).map((row) => {
            const cells = row.querySelectorAll("td");
            return {
              solutionId: cells[0]?.innerText || "",
              problemId: cells[2]?.querySelector("a")?.innerText || "",
              result: cells[3]?.querySelector("span")?.innerText || "",
              memory: cells[4]?.innerText || "",
              time: cells[5]?.innerText || "",
              language: cells[6]?.innerText || "",
              codeLength: cells[7]?.innerText || "",
              submissionTime:
                cells[8]
                  ?.querySelector("a")
                  ?.getAttribute("data-original-title") || ""
            };
          });
        })
        .flat();
    });

    await browser.close();

    return submissions;
  }
}
