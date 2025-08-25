import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  HttpStatus
} from "@nestjs/common";
import { SignUpRequest } from "./dto/request/signup.dto";
import { PrismaService } from "prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { LocalPayload } from "./security/payload/local.payload";
import { UserService } from "src/user/user.service";
import { SolvedAcService } from "src/solvedac/solvedac.service";
import { SubmissionService } from "src/submission/submission.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly solvedAcService: SolvedAcService,
    private readonly submissionService: SubmissionService
  ) {}

  private async encodePassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async createUser(signUpRequest: SignUpRequest): Promise<any> {
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

    // password encoding과 solvedac에서 유저 정보 조회하는 것은 순서 상관이 없으므로 병렬적으로 실행하기
    const [solvedAcData, password] = await Promise.all([
      await this.solvedAcService.fetchUserInfoFromSolvedAc(signUpRequest.name),
      await this.encodePassword(signUpRequest.password)
    ]);

    // 아래의 getUserSubmissions와 updateUserStatistics를 하기 전에 User 객체를 생성해놔야함
    // 아래 두 작업에는 user와의 연관관계가 있는데 아래꺼를 먼저하면 외래키 무결성에 어긋나기 때문!
    // 이쪽이 되게 비효율적인거 같긴한데 어떻게 바꿀 방법이 없으까..??
    user = await this.prisma.users.create({
      data: {
        name: signUpRequest.name,
        password: password,
        tier: solvedAcData.tier,
        streaks: 0,
        solvedProblemTags: {},
        solvedCount: solvedAcData.solvedCount,
        joinedAt: new Date(solvedAcData.joinedAt)
      }
    });

    // 회원가입한 사람의 제출내역 크롤링해서 미리 저장해두기
    await this.submissionService.getUserSubmissions(signUpRequest.name);

    // 제출내역 분석하여 부가정보 업데이트하기
    await this.userService.updateUserStatistics(signUpRequest.name);

    return {
      name: user.name,
      tier: solvedAcData.tier
    };
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
