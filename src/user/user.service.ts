import {
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { SignUpRequest } from "./../auth/dto/signup.dto";
import { LoginRequest } from "src/auth/dto/login.dto";

@Injectable()
export class UserService {
  // 의존성 주입
  // 할당 이후 재할당 불가능하도록 readonly로 설정
  constructor(private readonly prisma: PrismaService) {}

  async createUser(signUpRequest: SignUpRequest) {
    // user 스키마에 해당하는 필드 전체가 반환됨
    // include나 select로 관계필드 (managingGroups와 groups 까지 포함해서 반환시킬 수 도 있음)
    const user = await this.prisma.users.create({
      data: {
        boj_name: signUpRequest.boj_name,
        password: signUpRequest.password
      }
    });

    // prisma create의 결과물은 칼럼 전체임
    return user;
  }

  async login(loginRequest: LoginRequest) {
    const user = await this.prisma.users.findUnique({
      where: { boj_name: loginRequest.boj_name }
    });

    if (!user || user.password != loginRequest.password) {
      throw new UnauthorizedException();
    }

    return user;
  }

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
