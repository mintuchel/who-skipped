import { Injectable } from "@nestjs/common";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { JwtPayload } from "../payload/jwt.payload";
import { ConfigService } from "@nestjs/config";

// 나는 JWT 방식을 사용하는 것이므로 PassportStrategy에 passport-jwt에서 import한 JWT에 맞는 Strategy 타입을 정의
// 그리고 JWT Strategy가 필요한 스펙들을 생성자로 전달
// 각 Strategy들마다 필요한 스펙들은 정해져있음
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET")!
    });
  }

  // JWT 서명 검증, 유효기간만료 확인은 PassportStrategy 내부에서 자동으로 해줌
  // 하지만 그 외의 추가적인 유저 정보를 가져온다던가 내가 정의한 다른 접근 거부에 대한 확인들은
  // 이 validate 함수 내에서 직접 해줘야함.
  // 따라서 authService에 접근해서 다른 코드를 호출할 수 도 있음.
  // 여기서는 일단 추가적인 작업안하고 그대로 return만 해주기

  // 여기서 return된 Payload 타입이 req.user로 들어가는 것임!
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    return { id: payload.id, name: payload.name, role: payload.role };
  }
}
