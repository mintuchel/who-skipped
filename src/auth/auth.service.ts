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
import { LocalPayload } from "./security/payload/local.payload";
import { SolvedAcService } from "src/solvedac/solvedac.service";
import { SubmissionService } from "src/submission/submission.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly solvedAcService: SolvedAcService,
    private readonly submissionService: SubmissionService
  ) {}

  private async encodePassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async createUser(signUpRequest: SignUpRequest) {
    let user = await this.prisma.users.findUnique({
      where: { name: signUpRequest.name }
    });

    // 이미 해당 아이디가 존재한다면
    if (user) {
      throw new HttpException(
        "이미 사용중인 아이디입니다",
        HttpStatus.CONFLICT
      );
    }

    // password encoding
    // 이거 순서 상관없는데 Promise.all로 동시에 처리할까???
    const password = await this.encodePassword(signUpRequest.password);

    const solvedAcData = await this.solvedAcService.fetchUserInfoFromSolvedAc(
      signUpRequest.name
    );

    user = await this.prisma.users.create({
      data: {
        name: signUpRequest.name,
        password: password,
        tier: solvedAcData.tier,
        streaks: 0,
        solvedCount: solvedAcData.solvedCount,
        joinedAt: new Date(solvedAcData.joinedAt)
      }
    });

    // 회원가입한 사람의 제출내역 크롤링해서 미리 저장해두기
    await this.submissionService.getUserSubmissions(signUpRequest.name);

    // prisma create의 결과물은 칼럼 전체임
    return user;
  }

  // local-strategy의 validate 함수에서 사용되는 함수
  // LocalPayload 타입을 return
  async validateUser(name: string, password: string): Promise<LocalPayload> {
    const user = await this.prisma.users.findUnique({
      where: { name: name }
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
      name: user.name,
      role: user.role
    };
  }

  // Guard의 validate 함수가 request에 넣어준 LocalPayload 타입을 인자로 받아 서명
  // passport-jwt의 jwtService를 사용해서 access token 발급해서 return
  async login(localPayload: LocalPayload): Promise<string> {
    return this.jwtService.sign(localPayload);
  }
}
