import { Controller, Get, Param, UseGuards, Request } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserInfoResponse } from "./dto/response/user-info.dto";
import { UserGroupInfo } from "./dto/response/user-group-info.dto";
import { UserHeatMapInfoResponse } from "./dto/response/user-heatmap-info.dto";
import { JwtAuthGuard } from "src/auth/security/guard/jwt.guard";
import { UserSolvedProblemTagsInfoResponse } from "./dto/response/user-solved-problem-tags-info.dto";

@ApiTags("User")
@Controller("users")
export class UserController {
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
  @ApiOperation({ summary: "내 정보 조회" })
  async getProfile(@Request() req) {
    console.log("내 정보 조회");
    return req.user;
  }

  @Get("/heatmap")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "특정 유저의 30일간 히트맵 조회" })
  async getUserStreaks(@Request() req): Promise<UserHeatMapInfoResponse[]> {
    console.log("유저 30일간 히트맵 조회");
    return await this.userService.getUserHeatMap(req.user);
  }

  @Get("/:name")
  @ApiOperation({ summary: "특정 유저 조회" })
  async getUser(@Param("name") name: string): Promise<UserInfoResponse> {
    console.log("유저 조회");
    return await this.userService.getUser(name);
  }

  @Get("/:name/solved-tags")
  @ApiOperation({ summary: "특정 유저 해결 문제 유형 조회" })
  async getUserSolvedProblemTags(
    @Param("name") name: string
  ): Promise<UserSolvedProblemTagsInfoResponse[]> {
    console.log("특정 유저 해결 문제 유형 조회");
    return await this.userService.getUserSolvedProblemTags(name);
  }

  @Get("/:name/badges")
  @ApiOperation({ summary: "특정 유저 보유 뱃지 조회" })
  async getUserBadges(@Param("name") name: string) {
    console.log("특정 유저 보유 뱃지 조회");
    return await this.userService.getUserBadges(name);
  }
}
