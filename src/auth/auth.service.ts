import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import { SignUpRequest } from "./../auth/dto/signup.dto";
import { LoginRequest } from "src/auth/dto/login.dto";
import { PrismaService } from "prisma/prisma.service";
import { UserService } from "src/user/user.service";

import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService
  ) {}

  async encodePassword(password: string) {
    return await bcrypt.hash(password, 10);
  }

  async createUser(signUpRequest: SignUpRequest) {
    let user = await this.prisma.users.findUnique({
      where: { boj_name: signUpRequest.boj_name }
    });

    // 이미 해당 아이디가 존재한다면
    if (user) {
      throw new HttpException(
        "이미 사용중인 아이디입니다",
        HttpStatus.CONFLICT
      );
    }

    // password encoding
    const password = await this.encodePassword(signUpRequest.password);

    user = await this.prisma.users.create({
      data: {
        boj_name: signUpRequest.boj_name,
        password: password
      }
    });

    // prisma create의 결과물은 칼럼 전체임
    return user;
  }

  async login(loginRequest: LoginRequest) {
    const user = await this.prisma.users.findUnique({
      where: { boj_name: loginRequest.boj_name }
    });

    // 해당 유저를 찾을 수 없다면
    if (!user) {
      throw new NotFoundException("해당 유저를 찾을 수 없습니다");
    }

    // boolean return
    const encryptedpassword = await bcrypt.compare(
      loginRequest.password,
      user.password
    );

    if (!encryptedpassword) {
      throw new UnauthorizedException("비밀번호가 옳지 않습니다");
    }

    return user;
  }
}
