import { Body, Controller, Get, Param, Post, Delete } from "@nestjs/common";
import { UserService } from "./user.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("User")
@Controller("users")
export class UserController {
  // 유저 서비스 의존성 주입
  constructor(private readonly userService: UserService) {}

  @Get("")
  @ApiOperation({ summary: "유저 전체 조회" })
  getAllUsers() {
    console.log("유저 전체 조회");
    return this.userService.getAllUsers();
  }

  @Get("/:boj_name")
  @ApiOperation({ summary: "특정 유저 조회" })
  getUser(@Param("boj_name") boj_name: string) {
    console.log("유저 조회");
    return this.userService.getUser(boj_name);
  }

  @Delete("/:boj_name")
  @ApiOperation({ summary: "특정 유저 삭제" })
  deleteUser(@Param("id") boj_name: string) {
    console.log("유저 삭제");
    this.userService.deleteUser(boj_name);
    return "유저 삭제 성공!";
  }
}
