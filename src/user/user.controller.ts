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
import { UserGroupInfo } from "./dto/response/user-group-info.dto";
import { UserStreakInfoResponse } from "./dto/response/user-streak-info.dto";
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

  @Get("/me/groups")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "특정 유저 그룹 조회" })
  async getUserGroups(@Request() req): Promise<UserGroupInfo[]> {
    console.log("특정 유저 그룹 조회");
    return await this.userService.getUserGroups(req.user);
  }

  @Get("/me")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "내 정보" })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get("/streaks")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "특정 유저 스트릭 조회" })
  async getUserStreaks(@Request() req): Promise<UserStreakInfoResponse[]> {
    console.log("유저 한달간 스트릭 조회");
    return await this.userService.getUserStreaks(req.user);
  }

  @Get("/:name")
  @ApiOperation({ summary: "특정 유저 조회" })
  async getUser(@Param("name") name: string): Promise<UserInfoResponse> {
    console.log("유저 조회");
    return await this.userService.getUser(name);
  }
}
