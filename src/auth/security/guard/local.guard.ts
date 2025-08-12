import { ExecutionContext, Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

// AuthGuard에 local-strategy를 등록
// canActivate 발동 시 LocalStrategy 실행
@Injectable()
export class LocalAuthGuard extends AuthGuard("local") {
  canActivate(context: ExecutionContext): any {
    console.log("Local Guard 실행");
    return super.canActivate(context);
  }
}
