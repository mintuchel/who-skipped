import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request
} from "@nestjs/common";
import { GroupService } from "./group.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/security/guard/jwt.guard";
import { CreateGroupRequest } from "./dto/request/create-group.dto";
import { GroupInfoResponse } from "./dto/response/group-info.dto";

@ApiTags("Group")
@Controller("groups")
export class GroupController {
  // GroupService 의존성 주입
  constructor(private readonly groupService: GroupService) {}

  @Get("/:groupId")
  @ApiOperation({ summary: "특정 그룹 조회" })
  async getGroup(
    @Param("groupId") groupId: string
  ): Promise<GroupInfoResponse> {
    console.log("그룹 조회");
    return this.groupService.getGroup(groupId);
  }

  @Post("")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "그룹 생성" })
  async createGroup(
    @Request() req,
    @Body() createGroupRequest: CreateGroupRequest
  ) {
    const id = this.groupService.createGroup(req.user, createGroupRequest);
    return id;
  }

  // 그룹에 유저 추가
  // @Post(":groupId/users")
  // addUserToGroup(
  //   @Param("groupId") groupId: string,
  //   @Body() addUserDto: AddUserDto
  // ) {
  //   return this.groupsService.addUser(groupId, addUserDto);
  // }
}
