import { Controller, Post, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignUpRequest } from "./dto/signup.dto";
import { LoginRequest } from "./dto/login.dto";
import { ApiTags, ApiOperation } from "@nestjs/swagger";

@ApiTags("Authorization")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("")
  @ApiOperation({ summary: "회원가입" })
  signUp(@Body() signUpRequest: SignUpRequest) {
    // Prisma return 값을 그대로 return 하면 JSON 형식으로 변환되어 return됨
    return this.authService.createUser(signUpRequest);
  }

  @Post("/login")
  @ApiOperation({ summary: "로그인" })
  login(@Body() loginRequest: LoginRequest) {
    return this.authService.login(loginRequest);
  }
}
