import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { CreateUserRequest } from "./dto/create-user.dto";

@Injectable()
export class UserService {
  // 의존성 주입
  // 할당 이후 재할당 불가능하도록 readonly로 설정
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserRequest: CreateUserRequest) {
    // user 스키마에 해당하는 필드 전체가 반환됨
    // include나 select로 관계필드 (managingGroups와 groups 까지 포함해서 반환시킬 수 도 있음)
    const user = await this.prisma.users.create({
      data: {
        boj_name: createUserRequest.boj_name,
        password: createUserRequest.password
      }
    });

    return user.id;
  }

  async getAllUsers() {
    return await this.prisma.users.findMany();
  }

  async getUser(id: string) {
    const user = await this.prisma.users.findUnique({
      where: { id }
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
