import { Injectable } from "@nestjs/common";
import { ProblemInfoResponse } from "./dto/response/problem-info.dto";
import { PrismaService } from "prisma/prisma.service";
import axios from "axios";
import { ProblemTier } from "@prisma/client";

interface ProblemInfo {
  id: number;
  title: string;
  tier: ProblemTier;
  tags: string[];
}

@Injectable()
export class ProblemService {
  // module.ts에서 forFeature로 DI 컨테이너에 등록된 Model 객체를 주입
  // 실제로 Model이 반환하는 객체는 Document 타입이지만, 객체를 통해 CRUD 작업을 하는 것을 방지하기 위해
  // 타입스크립트의 컴파일 타임때 막아줄 수 있도록 타입 선언을 일반 자료형으로 함.
  constructor(private readonly prisma: PrismaService) {}

  private readonly BASE_URL = "https://solved.ac/api/v3/problem/show";

  // 특정 문제 조회
  async findOne(problemId: number): Promise<ProblemInfoResponse> {
    let problem = await this.prisma.problems.findUnique({
      where: { id: problemId },
      // 태그도 같이 조회
      include: { problemTags: true }
    });

    // 해당 문제가 존재하지 않는다면 solvedac api를 통해 정보 가져오기
    if (!problem) {
      console.log("해당 문제 존재하지 않음!");
      const problemInfo: ProblemInfo =
        await this.fetchProblemInfoBySolvedAC(problemId);

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

  // 전체 문제 조회
  async findAll(): Promise<ProblemInfoResponse[]> {
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

  // submissions 저장하기 전에 Problem 정보를 저장해야하기 때문에
  // 이거 먼저 호출해야함
  async addProblemsInSubmissions(problemList: number[]) {
    // race-condition으로 인해 저장되고 있는 얘를 또 조회때릴 수 있음
    // await Promise.all(
    //   problemList.map((problemId) => {
    //     this.findOne(problemId);
    //   })
    // );

    for (const problemId of problemList) {
      const problem = await this.findOne(problemId);
      console.log(problem);
    }

    console.log("제출내역 저장 전 필요한 문제 저장 완료");
  }

  // solvedac api를 통해 문제 정보 가져오기
  // ProblemInfo 타입으로 반환함
  private async fetchProblemInfoBySolvedAC(
    problemId: number
  ): Promise<ProblemInfo> {
    try {
      const response = await axios.get(this.BASE_URL, {
        params: { problemId }
      });

      console.log("문제 요청 성공");

      // JSON 추출
      const data = response.data;

      // titleKo 추출
      const title = data.titleKo;
      const tier = this.mapLevelToProblemTier(data.level);

      // tags 내 각 element에서 language==='ko'인 name 추출
      const tags = data.tags?.map((tag: any) => {
        const koNameObj = tag.displayNames.find(
          (dn: any) => dn.language === "ko"
        );
        return koNameObj ? koNameObj.name : null;
      });

      return {
        id: problemId,
        title,
        tier,
        tags
      };
    } catch (error) {
      console.error("solvedac 문제 정보 요청 에러");
      console.error(error);
      throw new Error("Failed to fetch api response from solvedac");
    }
  }

  private mapLevelToProblemTier(level: number): ProblemTier {
    switch (level) {
      case 1:
        return ProblemTier.Bronze5;
      case 2:
        return ProblemTier.Bronze4;
      case 3:
        return ProblemTier.Bronze3;
      case 4:
        return ProblemTier.Bronze2;
      case 5:
        return ProblemTier.Bronze1;
      case 6:
        return ProblemTier.Silver5;
      case 7:
        return ProblemTier.Silver4;
      case 8:
        return ProblemTier.Silver3;
      case 9:
        return ProblemTier.Silver2;
      case 10:
        return ProblemTier.Silver1;
      case 11:
        return ProblemTier.Gold5;
      case 12:
        return ProblemTier.Gold4;
      case 13:
        return ProblemTier.Gold3;
      case 14:
        return ProblemTier.Gold2;
      case 15:
        return ProblemTier.Gold1;
      case 16:
        return ProblemTier.Platinum5;
      case 17:
        return ProblemTier.Platinum4;
      case 18:
        return ProblemTier.Platinum3;
      case 19:
        return ProblemTier.Platinum2;
      case 20:
        return ProblemTier.Platinum1;
      case 21:
        return ProblemTier.Diamond5;
      case 22:
        return ProblemTier.Diamond4;
      case 23:
        return ProblemTier.Diamond3;
      case 24:
        return ProblemTier.Diamond2;
      case 25:
        return ProblemTier.Diamond1;
      case 26:
        return ProblemTier.Ruby5;
      case 27:
        return ProblemTier.Ruby4;
      case 28:
        return ProblemTier.Ruby3;
      case 29:
        return ProblemTier.Ruby2;
      case 30:
        return ProblemTier.Ruby1;
      default:
        return ProblemTier.Unranked;
    }
  }
}
