import { Injectable } from "@nestjs/common";
import { Submission } from "./submission.schema";
import { SubmissionInfoResponse } from "./dto/response/submission-info.dto";
import { SubmissionResult } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import puppeteer from "puppeteer-core";

// 최근 30일간까지만 스크롤

@Injectable()
export class SubmissionService {
  constructor(private readonly prisma: PrismaService) {}

  // 전체 제출내역 조회
  async getAllSubmissions(): Promise<SubmissionInfoResponse[]> {
    // solutionId 내림차순으로 정렬하여 반환
    // solutionId로 정렬하는게 날짜로 정렬하는 것이니까
    const submissions = await this.prisma.submissions.findMany({
      orderBy: {
        solutionId: "desc"
      }
    });

    return submissions.map((sub) => ({
      solutionId: sub.solutionId,
      name: sub.name,
      problemId: sub.problemId,
      result: sub.result,
      memory: sub.memory,
      time: sub.time,
      language: sub.language,
      codeLength: sub.codeLength,
      submittedAt: sub.submittedAt
    }));
  }

  private mapResultToSubmissionResult(result: string): SubmissionResult {
    switch (result) {
      case "맞았습니다!!":
        return SubmissionResult.ACCEPTED;
      case "틀렸습니다":
        return SubmissionResult.WRONG_ANSWER;
      case "시간 초과":
        return SubmissionResult.TIME_LIMIT_EXCEED;
      case "컴파일 에러":
        return SubmissionResult.COMPILE_ERROR;
      case "메모리 초과":
        return SubmissionResult.MEMORY_LIMIT_EXCEED;
      case "런타임 에러":
        return SubmissionResult.RUNTIME_ERROR;
      default:
        return SubmissionResult.WRONG_ANSWER;
    }
  }

  // prisma는 connect 없이도 관계 필드의 값을 직접 지정 가능!
  // connect를 사용하지 않더라도 연관관계 매핑이 된다
  private async saveSubmissions(submissions: Submission[]) {
    console.log(submissions);

    await this.prisma.submissions.createMany({
      data: submissions.map((submission) => ({
        name: submission.name,
        // number -> unsignedInt 타입으로 잘 저장가능
        solutionId: submission.solutionId,
        problemId: submission.problemId,
        // enum 값으로 매핑
        result: this.mapResultToSubmissionResult(submission.result),
        memory: submission.memory,
        time: submission.time,
        language: submission.language,
        codeLength: submission.codeLength,
        // String 값을 Date 형으로 변환해서 저장
        submittedAt: new Date(submission.submittedAt)
      }))
    });
  }

  // 특정 유저의 30일동안 푼 문제 가져옴
  // 각 유저마다 회원가입 했을때만 딱 한번 호출됨
  async getNewUsersSubmissions() {}

  private async getAllUsers(): Promise<string[]> {
    const users = await this.prisma.users.findMany({
      select: {
        name: true
      }
    });

    return users.map((user) => user.name);
  }

  // puppeteer 사용해서 크롤링
  // 푼 문제에 대한 정보가 mongodb에 없으면 problemservice에서 문제 조회해서 mongodb에 저장
  async getUserSubmissions(): Promise<string> {
    const userIdList = await this.getAllUsers();

    const browser = await puppeteer.launch({
      // headless: false하면 크롤링 창 보임
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

      while (1) {
        // 한 달 전 기록 index
        const count = await page.evaluate(() => {
          const oneMonthAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60; // 30일 전 timestamp

          // 이미 최신순으로 정렬된 배열 반환
          const timestamps = Array.from(
            document.querySelectorAll("a.real-time-update")
          ).map((a) => parseInt(a.getAttribute("data-timestamp") || "0"));

          // 한 달 전 제출내역에 대한 개수 반환
          // 기존 배열이 정렬되어있으므로 filter된 배열도 정렬되어있음
          return timestamps.filter((ts) => ts >= oneMonthAgo).length;
        });

        // evaluate의 콜백 함수는 브라우저(크롬 페이지 DOM)에서 실행되는 코드이므로
        // 해당 코드 내부에서 사용하는 함수들을 evaluate 함수 외부에서 실행하지 못함!
        const submissions = await page.evaluate((count) => {
          // 모든 제출내역 Row 선택
          const submissionRows = document.querySelectorAll("tbody tr");

          return Array.from(submissionRows)
            .slice(0, count) // 0부터 count-1 원소까지 축소
            .map((row) => {
              // 한 개의 제출내역 Row에서 각 Cell들 배열로 추출
              const cells = row.querySelectorAll("td");

              // timestamp 값 파싱
              const timestamp = parseInt(
                cells[8].querySelector("a")?.getAttribute("data-timestamp") ||
                  ""
              );

              // timestamp가 초단위이므로 밀리초로 바꾸고 ISO형식으로 바꿔서 날짜부분만 추출
              const submittedAt = new Date(timestamp * 1000)
                .toISOString()
                .split("T")[0];

              return {
                // JS Number는 9e15까지 안전함
                // parseInt해줘도 DB에는 unsignedInt로 잘 저장될 수 있다
                solutionId: parseInt(cells[0].innerText),
                name: cells[1].innerText,
                problemId:
                  parseInt(cells[2].querySelector("a")?.innerText || "0") || 0,
                result: cells[3].querySelector("span")?.innerText || "",
                memory: parseInt(cells[4]?.innerText || "0") || 0,
                time: parseInt(cells[5]?.innerText || "0") || 0,
                language: cells[6].innerText || "",
                codeLength: parseInt(cells[7].innerText) || 0,
                submittedAt: submittedAt
              };
            });
        }, count);

        await this.saveSubmissions(submissions);

        // 이번 페이지에서 끝났으면 크롤링 종료
        if (count < 20) break;

        // 아니면 다음 페이지까지 넘어가서 계속 진행
        await page.click("#next_page");
      }
    }

    await browser.close();

    return "제출 내역 크롤링 성공";
  }

  async deleteSubmissions() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    await this.prisma.submissions.deleteMany({
      where: {
        submittedAt: {
          lt: thirtyDaysAgo // 30일 전 이전 데이터 삭제
        }
      }
    });

    return "한 달 전 내역 삭제 성공";
  }
}
