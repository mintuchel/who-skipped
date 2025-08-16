import { Injectable } from "@nestjs/common";
import { Submission } from "./submission.schema";
import puppeteer from "puppeteer-core";
import { SubmissionResult } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  private async getAllUsers(): Promise<string[]> {
    const users = await this.prisma.users.findMany({
      select: {
        boj_name: true
      }
    });

    return users.map((user) => user.boj_name);
  }

  private mapResultToSubmissionResult(result: string): SubmissionResult {
    switch (result) {
      case "맞았습니다!!":
        return SubmissionResult.ACCEPTED;
      case "시간 초과":
        return SubmissionResult.TIME_LIMIT_EXCEED;
      case "틀렸습니다":
        return SubmissionResult.WRONG_ANSWER;
      case "메모리 초과":
        return SubmissionResult.MEMORY_LIMIT_EXCEED;
      case "컴파일 에러":
        return SubmissionResult.COMPILE_ERROR;
      case "런타임 에러":
        return SubmissionResult.RUNTIME_ERROR;
      default:
        return SubmissionResult.WRONG_ANSWER;
    }
  }

  // prisma는 connect 없이도 관계 필드의 값을 직접 지정 가능!
  // connect를 안써도 된다
  private async saveSubmissions(submissions: Submission[]) {
    await this.prisma.submissions.createMany({
      data: submissions.map((submission) => ({
        bojName: submission.bojName,
        solutionId: submission.solutionId,
        problemId: submission.problemId,
        result: this.mapResultToSubmissionResult(submission.result),
        memory: submission.memory,
        time: submission.time,
        language: submission.language,
        codeLength: submission.codeLength,
        submissionTime: submission.submissionTime
      }))
    });
  }

  // puppeteer 사용해서 크롤링
  // 푼 문제에 대한 정보가 mongodb에 없으면 problemservice에서 문제 조회해서 mongodb에 저장
  async getUserSubmissions() {
    const userIdList = await this.getAllUsers();

    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    });

    const page = await browser.newPage();

    for (const userId of userIdList) {
      await page.goto(
        `https://www.acmicpc.net/status?problem_id=&user_id=${userId}&language_id=-1&result_id=-1`,
        { waitUntil: "domcontentloaded" }
      );

      // puppeteer의 evaludate은 브라우저 안에서 코드를 실행하게 해주는 함수
      // html을 파싱하는 작업은 이 함수 안에서 해야함
      const submissions = await page.evaluate(() => {
        // tbody 요소 선택
        const tbodyElements = document.querySelectorAll("tbody");

        return Array.from(tbodyElements)
          .map((tbody) => {
            const rows = tbody.querySelectorAll("tr");
            return Array.from(rows).map((row) => {
              // 한 개의 cell 추출
              const cells = row.querySelectorAll("td");

              return {
                solutionId: parseInt(cells[0].innerText),
                bojName: cells[1].innerText,
                problemId:
                  parseInt(cells[2].querySelector("a")?.innerText || "0") || 0,
                result: cells[3].querySelector("span")?.innerText || "",
                memory: parseInt(cells[4].innerText) || 0,
                time: parseInt(cells[5].innerText) || 0,
                language: cells[6].innerText || "",
                codeLength: parseInt(cells[7].innerText) || 0,
                submissionTime:
                  cells[8]
                    .querySelector("a")
                    ?.getAttribute("data-original-title") || ""
              };
            });
          })
          .flat();
      });

      await this.saveSubmissions(submissions);
    }

    await browser.close();

    return "제출 내역 크롤링 성공";
  }
}
