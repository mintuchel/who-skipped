import {
  Controller,
  Get,
  Param,
  Delete,
  UseGuards,
  Request
} from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserInfoResponse } from "./dto/response/user-info.dto";
import { JwtAuthGuard } from "src/auth/security/guard/jwt.guard";

@ApiTags("User")
@Controller("users")
export class UserController {
  // 유저 서비스 의존성 주입
  constructor(private readonly userService: UserService) {}

  @Get("")
  @ApiOperation({ summary: "전체 유저 조회" })
  async getAllUsers(): Promise<UserInfoResponse[]> {
    console.log("유저 전체 조회");
    return await this.userService.getAllUsers();
  }

  @Get("/groups")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "특정 유저 그룹 조회" })
  async getUserGroups(@Request() req) {
    console.log("특정 유저 그룹 조회");
    return await this.userService.getUserGroups(req.user);
  }

  @Get("/me")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "내 정보" })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get("/:bojName")
  @ApiOperation({ summary: "특정 유저 조회" })
  async getUser(@Param("bojName") bojName: string): Promise<UserInfoResponse> {
    console.log("유저 조회");
    return await this.userService.getUser(bojName);
  }

  @Delete("/:bojName")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "회원탈퇴" })
  async deleteUser(@Param("bojName") bojName: string) {
    console.log("유저 삭제");
    await this.userService.deleteUser(bojName);
    return "유저 삭제 성공!";
  }
}
