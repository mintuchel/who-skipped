import { Injectable, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// AuthGuard에 jwt-strategy를 등록
// canActivate 발동 시 JwtStrategy 실행
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  canActivate(context: ExecutionContext): any {
    console.log("JWT Guard 실행");
    return super.canActivate(context);
  }
}
