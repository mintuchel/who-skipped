import { Body, Controller, Get, Param, Post, Delete } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserRequest } from "./dto/create-user.dto";

// @가 붙어있으면 데코레이터
@Controller("users")
export class UserController {
  // 유저 서비스 의존성 주입
  constructor(private readonly userService: UserService) {}

  @Post("")
  signup(@Body() createUserRequest: CreateUserRequest) {
    const id = this.userService.createUser(createUserRequest);
    return id;
  }

  @Get("")
  getAllUsers() {
    console.log("유저 전체 조회");
    return this.userService.getAllUsers();
  }

  @Get("/:id")
  getUser(@Param("id") id: string) {
    console.log("유저 조회");
    return this.userService.getUser(id);
  }

  @Delete("/:id")
  deleteUser(@Param("id") id: string) {
    console.log("유저 삭제");
    this.userService.deleteUser(id);
    return "유저 삭제 성공!";
  }
}
