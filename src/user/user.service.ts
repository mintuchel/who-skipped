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
      throw new NotFoundException("User with id ${id} not found");
    }

    return user;
  }

  async deleteUser(id: string) {
    return await this.prisma.users.delete({
      where: { id }
    });
  }
}
