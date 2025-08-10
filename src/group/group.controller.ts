import { Controller, Get, Post, Param, Body } from "@nestjs/common";
import { GroupService } from "./group.service";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Group")
@Controller("groups")
export class GroupController {
  // GroupService 의존성 주입
  constructor(private readonly groupService: GroupService) {}

  // @Get("/:id")
  // @ApiOperation({ summary: "특정 그룹 조회" })
  // getGroup(@Param("id") id: string) {
  //   console.log("그룹 조회");
  //   return this.groupService.getGroup(id);
  // }

  // @Post("")
  // @ApiOperation({ summary: "특정 그룹 생성" })
  // createGroup(@Body() createGroupRequest: CreateGroupRequest) {
  //   const id = this.groupService.createGroup(createGroupRequest);
  //   return id;
  // }
}
