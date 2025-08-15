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
import * as bcrypt from "bcrypt";
import { LocalPayload } from "./security/payload/local.payload";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  private async encodePassword(password: string): Promise<string> {
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

  // local-strategy의 validate 함수에서 사용되는 함수
  // LocalPayload 타입을 return
  async validateUser(
    boj_name: string,
    password: string
  ): Promise<LocalPayload> {
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

    return {
      id: user.id,
      boj_name: user.boj_name,
      role: user.role
    };
  }

  // Guard의 validate 함수가 request에 넣어준 LocalPayload 타입을 인자로 받아 서명
  // passport-jwt의 jwtService를 사용해서 access token 발급해서 return
  async login(localPayload: LocalPayload): Promise<string> {
    return this.jwtService.sign(localPayload);
  }
}
