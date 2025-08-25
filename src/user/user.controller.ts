import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request
} from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserInfoResponse } from "./dto/response/user-info.dto";
import { UserGroupInfo } from "./dto/response/user-group-info.dto";
import { UserStreakInfoResponse } from "./dto/response/user-streak-info.dto";
import { JwtAuthGuard } from "src/auth/security/guard/jwt.guard";
import { UserSolvedProblemTagsInfoResponse } from "./dto/response/user-solved-problem-tags-info.dto";

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
  @ApiOperation({ summary: "내 정보 조회" })
  async getProfile(@Request() req) {
    console.log("내 정보 조회");
    return req.user;
  }

  @Get("/streaks")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "특정 유저 스트릭 조회" })
  async getUserStreaks(@Request() req): Promise<UserStreakInfoResponse[]> {
    console.log("유저 한달간 스트릭 조회");
    return await this.userService.getUserStreaks(req.user);
  }

  @Patch("/solved-tags")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "특정 유저의 맞은 문제 유형 조회" })
  async updateUserSolvedTags(
    @Request() req
  ): Promise<UserSolvedProblemTagsInfoResponse[]> {
    console.log("특정 유저의 맞은 문제 유형 업데이트");
    return await this.userService.updateUserSolvedProblemTags(req.user);
  }

  @Get("/average-tries")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "특정 유저의 평균 시도 횟수 조회" })
  async getUserAverageTries(@Request() req): Promise<Number> {
    console.log("특정 유저의 평균 시도 횟수 조회");
    return await this.userService.getUserAverageTries(req.user);
  }

  @Get("/:name")
  @ApiOperation({ summary: "특정 유저 조회" })
  async getUser(@Param("name") name: string): Promise<UserInfoResponse> {
    console.log("유저 조회");
    return await this.userService.getUser(name);
  }
}
