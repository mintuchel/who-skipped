import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Problem } from "./problem.schema";
import { Model } from "mongoose";
import axios from "axios";
import { ProblemInfoResponse } from "./dto/response/problem-info.dto";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class ProblemService {
  // module.ts에서 forFeature로 DI 컨테이너에 등록된 Model 객체를 주입
  // 실제로 Model이 반환하는 객체는 Document 타입이지만, 객체를 통해 CRUD 작업을 하는 것을 방지하기 위해
  // 타입스크립트의 컴파일 타임때 막아줄 수 있도록 타입 선언을 일반 자료형으로 함.
  constructor(
    @InjectModel(Problem.name)
    private readonly problemModel: Model<Problem>,
    private readonly prisma: PrismaService
  ) {}

  private readonly BASE_URL = "https://solved.ac/api/v3/problem/show";

  // 특정 문제 조회
  async findOne(problemId: number): Promise<ProblemInfoResponse> {
    let problem = await this.problemModel.findOne({ problemId: problemId });

    // 해당 문제가 존재하지 않는다면 solvedac api를 통해 정보 가져오기
    if (!problem) {
      console.log("해당 문제 존재하지 않음!");
      const problemInfo = await this.fetchProblemInfoBySolvedAC(problemId);
      problem = await this.problemModel.insertOne(problemInfo);
    }

    return {
      problemId: problem.problemId,
      title: problem.title,
      tags: problem.tags
    };
  }

  // Submissions에 등록된 문제에 대한 정보 SolvedAC API로 받아오기
  async getProblemsInSubmissions(): Promise<number> {
    // 이미 문제정보가 있는 것 받기
    const existingProblemIdList: number[] =
      await this.problemModel.distinct("problemId");

    // 문제정보 없는 것들만 추리기
    const problemIdRecords = await this.prisma.submissions.findMany({
      distinct: ["problemId"],
      where: {
        problemId: {
          notIn: existingProblemIdList
        }
      },
      select: {
        problemId: true
      }
    });

    // Promise.all을 통해 병렬 처리
    // 서로 관계가 없고 순서가 중요하지 않으므로
    // Promise.all의 return 값은 항상 배열 (여러 Promise들의 결과를 반환하므로)
    const problemInfoList: Problem[] = await Promise.all(
      problemIdRecords.map((records) =>
        this.fetchProblemInfoBySolvedAC(records.problemId)
      )
    );

    // create보다 insertMany가 성능적으로 훨씬 좋다
    // ordered:false를 통해 오류가 나도 무시하고 계속 진행
    await this.problemModel.insertMany(problemInfoList, { ordered: false });

    console.log(problemIdRecords.length + "개의 새로운 문제가 추가되었습니다");
    return problemIdRecords.length;
  }

  // 전체 문제 조회
  async findAll(): Promise<ProblemInfoResponse[]> {
    const problems = await this.problemModel.find().exec();

    return problems.map((problem) => ({
      problemId: problem.problemId,
      title: problem.title,
      tags: problem.tags
    }));
  }

  // solvedac api를 통해 문제 정보 가져오기
  private async fetchProblemInfoBySolvedAC(
    problemId: number
  ): Promise<Problem> {
    try {
      const response = await axios.get(this.BASE_URL, {
        params: { problemId }
      });

      console.log("문제 요청 성공");

      // JSON 추출
      const data = response.data;

      // titleKo 추출
      const title = data.titleKo;

      // tags 내 각 element에서 language==='ko'인 name 추출
      const tags = data.tags?.map((tag: any) => {
        const koNameObj = tag.displayNames.find(
          (dn: any) => dn.language === "ko"
        );
        return koNameObj ? koNameObj.name : null;
      });

      return {
        problemId,
        title,
        tags
      };
    } catch (error) {
      console.error("solvedac 문제 정보 요청 에러");
      console.error(error);
      throw new Error("Failed to fetch api response from solvedac");
    }
  }
}
