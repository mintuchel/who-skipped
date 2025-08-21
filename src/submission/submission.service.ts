import { Injectable } from "@nestjs/common";
import { Submission } from "./submission.schema";
import { SubmissionInfoResponse } from "./dto/response/submission-info.dto";
import { SubmissionResult } from "@prisma/client";
import { PrismaService } from "prisma/prisma.service";
import puppeteer from "puppeteer-core";
import { ProblemService } from "src/problem/problem.service";

@Injectable()
export class SubmissionService {
  // Enum으로 매핑하기 위한 Map 자료구조 사용
  // 조회 O(1)로 맞을때까지 조건문 타는 switch문보다 빠르게
  private readonly resultToSubmissionResultMap: Map<string, SubmissionResult>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly problemService: ProblemService
  ) {
    this.resultToSubmissionResultMap = new Map<string, SubmissionResult>([
      ["맞았습니다!!", SubmissionResult.ACCEPTED],
      ["틀렸습니다", SubmissionResult.WRONG_ANSWER],
      ["시간 초과", SubmissionResult.TIME_LIMIT],
      ["컴파일 에러", SubmissionResult.COMPILE_ERROR],
      ["출력 초과", SubmissionResult.OUTPUT_LIMIT],
      ["출력 형식이 잘못되었습니다", SubmissionResult.OUTPUT_FORMAT_ERROR]
    ]);
  }

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

  // puppeteer 사용해서 크롤링
  // 회원가입 시 호출됨
  async getUserSubmissions(name: String): Promise<void> {
    const browser = await puppeteer.launch({
      // headless: false하면 크롤링 창 보임
      headless: false,
      defaultViewport: null,
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    });

    // 창 열고 제출내역 페이지로 이동
    const page = await browser.newPage();
    await page.goto(
      `https://www.acmicpc.net/status?problem_id=&user_id=${name}&language_id=-1&result_id=-1`,
      { waitUntil: "domcontentloaded" }
    );

    while (1) {
      // evaluate의 콜백 함수는 브라우저(크롬 페이지 DOM)에서 실행되는 코드이므로
      // 해당 코드 내부에서 사용하는 함수들을 evaluate 함수 외부에서 실행하지 못함!
      // 한 달 전 제출내역들의 갯수 파악하기
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

      const submissions = await page.evaluate((count) => {
        // 모든 제출내역 Row 선택
        const submissionRows = document.querySelectorAll("tbody tr");

        return Array.from(submissionRows)
          .slice(0, count) // 0부터 count-1 원소까지 축소
          .map((row) => {
            // 한 개의 제출내역 Row에서 각 Cell들 배열로 추출
            const cells = row.querySelectorAll("td");

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
              // timestamp 값 파싱 (이건 UTC기준 값임 -> 서버에서 한국시간대로 변환)
              submittedAt: parseInt(
                cells[8].querySelector("a")?.getAttribute("data-timestamp") ||
                  ""
              )
            };
          });
      }, count);

      const problemIdList = submissions.map((sub) => sub.problemId);
      // 문제 먼저 조회해서 저장
      // Submissions가 외래키로 문제 번호를 가지고 있으므로 문제를 미리 저장해야함
      await this.problemService.saveProblemsInSubmissions(problemIdList);
      // 제출내역 DB에 저장
      await this.saveSubmissions(submissions);

      // 이번 페이지에서 끝났으면 크롤링 종료
      if (count < 20) break;

      // 아니면 다음 페이지까지 넘어가서 계속 진행
      await page.click("#next_page");
    }

    await browser.close();

    console.log(name, "의 제출 내역 크롤링 성공");
  }

  // prisma는 connect 없이도 관계 필드의 값을 직접 지정 가능!
  // connect를 사용하지 않더라도 연관관계 매핑이 된다
  private async saveSubmissions(submissions: Submission[]) {
    await this.prisma.submissions.createMany({
      data: submissions.map((submission) => ({
        name: submission.name,
        // number -> unsignedInt 타입으로 잘 저장가능
        solutionId: submission.solutionId,
        problemId: submission.problemId,
        // enum 값으로 매핑
        result:
          this.resultToSubmissionResultMap.get(submission.result) ??
          SubmissionResult.RUNTIME_ERROR,
        memory: submission.memory,
        time: submission.time,
        language: submission.language,
        codeLength: submission.codeLength,
        // 1. Javascript 객체는 ms초 단위를 사용하므로 크롤링한 초단위인 timestamp에 1000을 곱해줘야함
        // 2. Timestamp는 UTC 기준의 절대시간이므로 정확한 한국 시간을 도출하기 위해서는 +09:00 즉, 9시간을 더해줘야함
        //    9시간 = 9 * 60 * 60 * 1000 = 32400000 밀리초
        submittedAt: new Date(submission.submittedAt * 1000 + 32400000)
      }))
    });
  }
}
