import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { AuthService } from "src/auth/auth.service";

// LocalStrategy 방식을 사용할 것이므로 passport-local의 Strategy Import
// passport-local에서 정의한 Strategy가 필요한 스펙들을 super로 전달
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "local") {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: "boj_name",
      passwordField: "password"
    });
  }

  // HTTP Request Body를 자동으로 파싱해서 매개변수들과 매핑해줌
  async validate(boj_name: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(boj_name, password);
    return user;
  }
}
