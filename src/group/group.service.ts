import { PrismaService } from "prisma/prisma.service";
import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateGroupRequest } from "./dto/request/create-group.dto";
import { JwtPayload } from "jsonwebtoken";
import { GroupInfoResponse } from "./dto/response/group-info.dto";

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  // 그룹 생성
  async createGroup(
    payload: JwtPayload,
    createGroupRequest: CreateGroupRequest
  ): Promise<GroupInfoResponse> {
    const group = await this.prisma.groups.create({
      data: {
        name: createGroupRequest.name,
        fine: createGroupRequest.fine,
        managerName: payload.boj_name,
        manager: {
          connect: { id: payload.id }
        }
      }
    });

    return {
      name: group.name,
      manager: group.managerName,
      fine: group.fine
    };
  }

  // 특정 그룹 조회
  async getGroup(groupName: string): Promise<GroupInfoResponse> {
    const group = await this.prisma.groups.findUnique({
      where: { name: groupName }
    });

    if (!group) {
      throw new NotFoundException(groupName + " 그룹을 찾을 수 없습니다");
    }

    return {
      name: group.name,
      manager: group.managerName,
      fine: group.fine
    };
  }
}
