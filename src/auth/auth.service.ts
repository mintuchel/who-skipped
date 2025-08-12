import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import { SignUpRequest } from "./../auth/dto/signup.dto";
import { PrismaService } from "prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { Payload } from "./security/payload.interface";
import * as bcrypt from "bcrypt";
import { Users } from "@prisma/client";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  private async encodePassword(password: string) {
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

  // Local-Guard에서 활용하는 함수
  // 로그인 요청시에만 호출되며 이 함수를 통해 허가된 사용자에게
  // access token을 발급해준다
  async validateUser(boj_name: string, password: string) {
    const user = await this.prisma.users.findUnique({
      where: { boj_name: boj_name }
    });

    if (!user) {
      throw new NotFoundException("아아디를 찾을 수 없습니다");
    }

    // boolean return
    const encryptedpassword = await bcrypt.compare(password, user.password);

    if (!encryptedpassword) {
      throw new UnauthorizedException("비밀번호가 옳지 않습니다");
    }

    return user;
  }

  // Guard의 validate 함수가 return해준 User 객체 사용
  async login(user: Users) {
    const payload: Payload = { id: user.id, boj_name: user.boj_name };
    // passport-jwt의 jwtService를 사용해서 access token 발급해서 return
    return this.jwtService.sign(payload);
  }
}
