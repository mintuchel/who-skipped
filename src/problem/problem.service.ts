import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Problem, ProblemDocument } from "./problem.schema";
import { Model } from "mongoose";
import axios from "axios";

@Injectable()
export class ProblemService {
  // module.ts에서 forFeature로 DI 컨테이너에 등록된 Model 객체를 주입
  // 반환하는 객체로는 HydratedDocument
  constructor(
    @InjectModel(Problem.name)
    private readonly problemModel: Model<ProblemDocument>
  ) {}

  private readonly BASE_URL = "https://solved.ac/api/v3/problem/show";

  // 이거 Promise<Problem>으로 가능하게 만들어보기
  async findOne(problemId: number): Promise<any> {
    let problem = await this.problemModel.findOne({ problemId: problemId });

    // 해당 문제가 존재하지 않는다면 solvedac api를 통해 정보 가져오기
    if (!problem) {
      console.log("문제 존재하지 않음!");
      const problemInfo = await this.getProblemInfo(problemId);
      problem = await this.problemModel.insertOne(problemInfo);
    }

    return problem;
  }

  // 전체 조회
  async findAll(): Promise<Problem[]> {
    return await this.problemModel.find().exec();
  }

  // solvedac api를 통해 문제 정보 가져오기
  private async getProblemInfo(problemId: number) {
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
