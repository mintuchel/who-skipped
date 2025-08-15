import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe
} from "@nestjs/common";
import { GroupService } from "./group.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/security/guard/jwt.guard";
import { CreateGroupRequest } from "./dto/request/create-group.dto";
import { GroupInfoResponse } from "./dto/response/group-info.dto";
import { AddUsersToGroupRequest } from "./dto/request/add-users-to-group.dto";

@ApiTags("Group")
@Controller("groups")
export class GroupController {
  // GroupService 의존성 주입
  constructor(private readonly groupService: GroupService) {}

  @Get("")
  @ApiOperation({ summary: "전체 그룹 조회" })
  async getAllGroups(): Promise<GroupInfoResponse[]> {
    console.log("전체 그룹 조회");
    return this.groupService.findAll();
  }

  @Get("/:groupId")
  @ApiOperation({ summary: "특정 그룹 조회" })
  async getGroup(
    @Param("groupId", ParseIntPipe) groupId: number
  ): Promise<GroupInfoResponse> {
    console.log("특정 그룹 조회");
    return this.groupService.getGroup(groupId);
  }

  @Post("")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "그룹 생성" })
  async createGroup(
    @Request() req,
    @Body() createGroupRequest: CreateGroupRequest
  ): Promise<number> {
    const id = this.groupService.createGroup(req.user, createGroupRequest);
    return id;
  }

  @Post(":groupId/users")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "특정 그룹에 유저 추가" })
  async addUserToGroup(
    @Request() req,
    @Param("groupId", ParseIntPipe) groupId: number,
    @Body() addUsersToGroupRequest: AddUsersToGroupRequest
  ) {
    console.log("특정 그룹에 유저 추가");
    await this.groupService.addUsersToGroup(
      req.user,
      groupId,
      addUsersToGroupRequest
    );
  }
}
