import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
  ParseIntPipe
} from "@nestjs/common";
import { GroupService } from "./group.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/auth/security/guard/jwt.guard";
import {
  CreateGroupRequest,
  GroupInfoResponse,
  AddUsersToGroupRequest,
  DeleteUsersFromGroupRequest,
  GroupSummaryResponse,
  UpdateGroupManagerRequest,
  UpdateGroupDescriptionRequest
} from "./dto";

@ApiTags("Group")
@Controller("groups")
export class GroupController {
  // GroupService 의존성 주입
  constructor(private readonly groupService: GroupService) {}

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

  @Get("")
  @ApiOperation({ summary: "전체 그룹 조회" })
  async getAllGroups(): Promise<GroupSummaryResponse[]> {
    console.log("전체 그룹 조회");
    return this.groupService.findAll();
  }

  @Get("/:groupId")
  @ApiOperation({ summary: "특정 그룹 조회" })
  async getGroup(
    @Param("groupId", ParseIntPipe) groupId: number
  ): Promise<GroupInfoResponse> {
    console.log("특정 그룹 조회");
    return this.groupService.findOne(groupId);
  }

  @Post("/:groupId/users")
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

  @Delete("/:groupId/users")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "특정 그룹에 유저 삭제" })
  async deleteUsersFromGroup(
    @Request() req,
    @Param("groupId", ParseIntPipe) groupId: number,
    @Body() deleteUsersFromGroupRequest: DeleteUsersFromGroupRequest
  ) {
    console.log("특정 그룹에서 유저 삭제");
    await this.groupService.deleteUsersFromGroup(
      req.user,
      groupId,
      deleteUsersFromGroupRequest
    );
  }

  @Patch("/:groupId/manager")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "그룹 매니저 변경"
  })
  async updateGroupManager(
    @Request() req,
    @Param("groupId", ParseIntPipe) groupId: number,
    @Body() updateGroupManagerRequest: UpdateGroupManagerRequest
  ): Promise<GroupSummaryResponse> {
    console.log("그룹 매니저 변경");
    return await this.groupService.updateGroupManager(
      req.user,
      groupId,
      updateGroupManagerRequest.newManagerName
    );
  }

  @Patch("/:groupId/description")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: "그룹 소개 변경"
  })
  async updateGroupDescription(
    @Request() req,
    @Param("groupId", ParseIntPipe) groupId: number,
    @Body() updateGroupDescriptionRequest: UpdateGroupDescriptionRequest
  ): Promise<GroupSummaryResponse> {
    console.log("그룹 소개 변경");
    return await this.groupService.updateGroupDescription(
      req.user,
      groupId,
      updateGroupDescriptionRequest.newDescription
    );
  }
}
