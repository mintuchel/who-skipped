import { SolvedAcService } from "./../solvedac/solvedac.service";
import { Injectable } from "@nestjs/common";
import { ProblemInfoResponse } from "./dto/response/problem-info.dto";
import { PrismaService } from "prisma/prisma.service";
import { ProblemInfo } from "./problem.schema";

@Injectable()
export class ProblemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly solvedAcService: SolvedAcService
  ) {}

  // 전체 문제 조회
  async getAllProblems(): Promise<ProblemInfoResponse[]> {
    const problems = await this.prisma.problems.findMany({
      // problemTags까지 가져오기
      include: {
        problemTags: true
      }
    });

    return problems.map((problem) => ({
      problemId: problem.id,
      title: problem.title,
      tier: problem.tier,
      tags: problem.problemTags.map((tags) => tags.tag)
    }));
  }

  // 특정 문제 조회
  async getProblem(problemId: number): Promise<ProblemInfoResponse> {
    let problem = await this.prisma.problems.findUnique({
      where: { id: problemId },
      // 태그도 같이 조회
      include: { problemTags: true }
    });

    // 해당 문제가 존재하지 않는다면 solvedac api를 통해 정보 가져오기
    if (!problem) {
      console.log("해당 문제 존재하지 않음!");
      const problemInfo: ProblemInfo =
        await this.solvedAcService.fetchProblemInfoFromSolvedAc(problemId);

      problem = await this.prisma.problems.create({
        data: {
          id: problemInfo.id,
          title: problemInfo.title,
          tier: problemInfo.tier,
          problemTags: {
            create: problemInfo.tags.map((tagName) => ({
              tag: tagName
            }))
          }
        },
        include: { problemTags: true }
      });
    }

    return {
      problemId: problem.id,
      title: problem.title,
      tier: problem.tier,
      // id problemId 말고 태그 배열만 따로 추출
      tags: problem.problemTags.map((pt) => pt.tag)
    };
  }

  // submissions 저장하기 전에 Problem 정보를 저장해야하기 때문에
  // 이거 먼저 호출해야함
  async saveProblemsInSubmissions(problemList: number[]) {
    // race-condition으로 인해 저장되고 있는 얘를 또 조회때릴 수 있음
    // await Promise.all(
    //   problemList.map((problemId) => {
    //     this.findOne(problemId);
    //   })
    // );

    for (const problemId of problemList) {
      await this.getProblem(problemId);
    }

    console.log("제출내역 저장 전 필요한 문제 저장 완료");
  }
}
