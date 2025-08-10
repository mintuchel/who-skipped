import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe
} from "@nestjs/common";
import { GroupService } from "./group.service";

@Controller("groups")
export class GroupController {
  // GroupService 의존성 주입
  constructor(private readonly groupService: GroupService) {}

  @Get("/:id")
  getGroup(@Param("id") id: string) {
    console.log("그룹 조회");
    return this.groupService.getGroup(id);
  }

  @Post("")
  createGroup(@Body() createGroupRequest: CreateGroupRequest) {
    const id = this.groupService.createGroup(createGroupRequest);
    return id;
  }
}
