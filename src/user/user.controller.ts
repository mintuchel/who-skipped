import { Body, Controller, Get, Param, Post, Delete } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { UserInfoResponse } from "./dto/response/user-info.dto";

@ApiTags("User")
@Controller("users")
export class UserController {
  // 유저 서비스 의존성 주입
  constructor(private readonly userService: UserService) {}

  @Get("")
  @ApiOperation({ summary: "유저 전체 조회" })
  async getAllUsers(): Promise<UserInfoResponse[]> {
    console.log("유저 전체 조회");
    return await this.userService.getAllUsers();
  }

  @Get("/:bojName")
  @ApiOperation({ summary: "특정 유저 조회" })
  async getUser(@Param("bojName") bojName: string): Promise<UserInfoResponse> {
    console.log("유저 조회");
    return await this.userService.getUser(bojName);
  }

  @Delete("/:bojName")
  @ApiOperation({ summary: "특정 유저 삭제" })
  async deleteUser(@Param("bojName") bojName: string) {
    console.log("유저 삭제");
    await this.userService.deleteUser(bojName);
    return "유저 삭제 성공!";
  }
}
