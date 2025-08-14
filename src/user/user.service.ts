import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";

@Injectable()
export class UserService {
  // 의존성 주입
  // 할당 이후 재할당 불가능하도록 readonly로 설정
  constructor(private readonly prisma: PrismaService) {}

  async getAllUsers() {
    return await this.prisma.users.findMany();
  }

  async getUser(boj_name: string) {
    const user = await this.prisma.users.findUnique({
      where: { boj_name: boj_name }
    });

    if (!user) {
      throw new NotFoundException(`User with id ${boj_name} not found`);
    }

    return user;
  }

  // puppeteer 사용해서 크롤링
  // 푼 문제에 대한 정보가 mongodb에 없으면 problemservice에서 문제 조회해서 mongodb에 저장
  async getUserSubmissions(boj_name: string) {}

  async deleteUser(boj_name: string) {
    return await this.prisma.users.delete({
      where: { boj_name: boj_name }
    });
  }
}
