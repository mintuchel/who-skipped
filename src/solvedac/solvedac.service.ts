import { Injectable } from "@nestjs/common";
import { SolvedAcTier } from "@prisma/client";
import { ProblemInfo } from "src/problem/problem.schema";
import { UserSolvedacInfoResponse } from "src/user/dto/response/user-solvedac-info.dto";
import axios from "axios";

// Response랑 서비스끼리 주고받는 Dto랑 확실히 구분되게 파일명 작성하기 그리고 폴더링 리팩토링하기
@Injectable()
export class SolvedAcService {
  private readonly USER_INFO_BASE_URL = "https://solved.ac/api/v3/user/show";
  private readonly PROBLEM_INFO_BASE_URL =
    "https://solved.ac/api/v3/problem/show";

  private readonly levelToTierMap: Map<number, SolvedAcTier>;

  constructor() {
    this.levelToTierMap = new Map<number, SolvedAcTier>([
      [0, SolvedAcTier.Unranked],
      [1, SolvedAcTier.Bronze5],
      [2, SolvedAcTier.Bronze4],
      [3, SolvedAcTier.Bronze3],
      [4, SolvedAcTier.Bronze2],
      [5, SolvedAcTier.Bronze1],
      [6, SolvedAcTier.Silver5],
      [7, SolvedAcTier.Silver4],
      [8, SolvedAcTier.Silver3],
      [9, SolvedAcTier.Silver2],
      [10, SolvedAcTier.Silver1],
      [11, SolvedAcTier.Gold5],
      [12, SolvedAcTier.Gold4],
      [13, SolvedAcTier.Gold3],
      [14, SolvedAcTier.Gold2],
      [15, SolvedAcTier.Gold1],
      [16, SolvedAcTier.Platinum5],
      [17, SolvedAcTier.Platinum4],
      [18, SolvedAcTier.Platinum3],
      [19, SolvedAcTier.Platinum2],
      [20, SolvedAcTier.Platinum1],
      [21, SolvedAcTier.Diamond5],
      [22, SolvedAcTier.Diamond4],
      [23, SolvedAcTier.Diamond3],
      [24, SolvedAcTier.Diamond2],
      [25, SolvedAcTier.Diamond1],
      [26, SolvedAcTier.Ruby5],
      [27, SolvedAcTier.Ruby4],
      [28, SolvedAcTier.Ruby3],
      [29, SolvedAcTier.Ruby2],
      [30, SolvedAcTier.Ruby1]
    ]);
  }
  async fetchUserInfoFromSolvedAc(
    handle: string
  ): Promise<UserSolvedacInfoResponse> {
    try {
      const response = await axios.get(this.USER_INFO_BASE_URL, {
        params: { handle }
      });

      console.log("사용자 정보 요청 성공");

      // JSON 추출
      const data = response.data;

      return {
        tier: this.levelToTierMap.get(data.tier) ?? SolvedAcTier.Unranked,
        solvedCount: data.solvedCount,
        joinedAt: data.joinedAt
      };
    } catch (error) {
      console.error("SolvedAc 사용자 정보 요청 실패");
      console.error(error);
      throw new Error("SolvedAc 사용자 정보 요청 실패");
    }
  }

  // solvedac api를 통해 문제 정보 가져오기
  // ProblemInfo 타입으로 반환함
  async fetchProblemInfoFromSolvedAc(problemId: number): Promise<ProblemInfo> {
    try {
      const response = await axios.get(this.PROBLEM_INFO_BASE_URL, {
        params: { problemId }
      });

      console.log("문제 요청 성공");

      // JSON 추출
      const data = response.data;

      // titleKo 추출
      const title = data.titleKo;
      const tier = this.levelToTierMap.get(data.level) ?? SolvedAcTier.Unranked;

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
      console.error("SolvedAc 문제 정보 요청 실패");
      console.error(error);
      throw new Error("SolvedAc 문제 정보 요청 실패");
    }
  }
}
