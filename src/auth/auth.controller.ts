import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Response,
  UseGuards
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import { SignUpRequest } from "./dto/signup.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { JwtAuthGuard } from "./security/guard/jwt.guard";
import { LocalAuthGuard } from "./security/guard/local.guard";

@ApiTags("Authorization")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/signup")
  @ApiOperation({ summary: "회원가입" })
  signUp(@Body() signUpRequest: SignUpRequest) {
    // Prisma return 값을 그대로 return 하면 JSON 형식으로 변환되어 return됨
    return this.authService.createUser(signUpRequest);
  }

  @UseGuards(LocalAuthGuard)
  @Post("/login")
  @ApiOperation({ summary: "로그인" })
  async login(@Request() req, @Response() res): Promise<string> {
    const accessToken: string = await this.authService.login(req.user);
    // 나중에 이 부분 interceptor로 처리해보기
    res.setHeader("Authorization", "Bearer " + accessToken);
    return res.json(accessToken);
  }
}
