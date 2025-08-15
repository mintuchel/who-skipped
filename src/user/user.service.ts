import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { UserInfoResponse } from "./dto/response/user-info.dto";

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

  async createGroupMembership() {}

  // puppeteer 사용해서 크롤링
  // 푼 문제에 대한 정보가 mongodb에 없으면 problemservice에서 문제 조회해서 mongodb에 저장
  async getUserSubmissions(bojName: string) {}

  async deleteUser(bojName: string) {
    // delete는 삭제된 레코드 전체를 반환
    return await this.prisma.users.delete({
      where: { boj_name: bojName }
    });
  }
}
