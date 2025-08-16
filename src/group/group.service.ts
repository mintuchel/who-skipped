import { AddUsersToGroupRequest } from "./dto/request/add-users-to-group.dto";
import { PrismaService } from "prisma/prisma.service";
import {
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import { CreateGroupRequest } from "./dto/request/create-group.dto";
import { GroupInfoResponse } from "./dto/response/group-info.dto";
import { JwtPayload } from "src/auth/security/payload/jwt.payload";

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  // 그룹 생성
  async createGroup(
    payload: JwtPayload,
    createGroupRequest: CreateGroupRequest
  ): Promise<number> {
    const group = await this.prisma.groups.create({
      data: {
        name: createGroupRequest.name,
        managerName: payload.name,
        manager: {
          connect: { id: payload.id }
        }
      }
    });

    return group.id;
  }

  // 전체 그룹 조회
  async findAll(): Promise<GroupInfoResponse[]> {
    const groups = await this.prisma.groups.findMany();

    return groups.map((group) => ({
      name: group.name,
      manager: group.managerName,
      created_at: group.createdAt
    }));
  }

  // 특정 그룹 조회
  async getGroup(groupId: number): Promise<GroupInfoResponse> {
    const group = await this.prisma.groups.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundException(groupId + " 그룹을 찾을 수 없습니다");
    }

    return {
      name: group.name,
      manager: group.managerName,
      created_at: group.createdAt
    };
  }

  // 그룹에 유저들 추가
  async addUsersToGroup(
    payload: JwtPayload,
    groupId: number,
    request: AddUsersToGroupRequest
  ) {
    const group = await this.prisma.groups.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundException(groupId + " 그룹을 찾을 수 없습니다");
    }

    if (group.managerName !== payload.name) {
      throw new UnauthorizedException("해당 그룹의 매니저가 아닙니다");
    }

    // id들만 조회
    const users = await this.prisma.users.findMany({
      where: { name: { in: request.names } },
      select: { id: true }
    });

    // 이거 나중에 createMany로 바꿔보기
    for (const user of users) {
      await this.prisma.groupMembership
        .create({
          data: {
            user: { connect: { id: user.id } },
            group: { connect: { id: groupId } }
          }
        })
        .catch((err) => {
          if (err.code !== "P2002") {
            console.log("중복된 groupmembership 존재");
          }
        });
    }
  }
}
