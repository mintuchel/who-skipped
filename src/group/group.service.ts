import { PrismaService } from "prisma/prisma.service";
import {
  Injectable,
  NotFoundException,
  UnauthorizedException
} from "@nestjs/common";
import {
  CreateGroupRequest,
  AddUsersToGroupRequest,
  DeleteUsersFromGroupRequest,
  GroupInfoResponse,
  GroupSummaryResponse
} from "./dto";
import { JwtPayload } from "src/auth/security/payload/jwt.payload";

@Injectable()
export class GroupService {
  constructor(private readonly prisma: PrismaService) {}

  // 그룹 생성
  async createGroup(
    payload: JwtPayload,
    createGroupRequest: CreateGroupRequest
  ): Promise<number> {
    // 새 그룹 생성
    const group = await this.prisma.groups.create({
      data: {
        name: createGroupRequest.name,
        description: createGroupRequest.description,
        managerName: payload.name,
        manager: {
          connect: { id: payload.id }
        }
      }
    });

    // 생성된 그룹에 대한 매니저의 GroupMembership 생성
    // connect와 직접 외래키 필드를 채워넣는 것의 성능 차이??
    const groupMemberShip = await this.prisma.groupMemberships.create({
      data: {
        user: { connect: { id: payload.id } },
        group: { connect: { id: group.id } }
      }
    });

    return group.id;
  }

  // 전체 그룹 조회
  async findAll(): Promise<GroupSummaryResponse[]> {
    const groups = await this.prisma.groups.findMany();

    return groups.map((group) => ({
      name: group.name,
      manager: group.managerName,
      createdAt: group.createdAt
    }));
  }

  // 특정 그룹 조회
  async findOne(groupId: number): Promise<GroupInfoResponse> {
    const group = await this.prisma.groups.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundException(groupId + " 그룹을 찾을 수 없습니다");
    }

    const groupMembers = await this.prisma.$queryRaw<
      GroupInfoResponse["members"]
    >`SELECT u.name AS name , u.skippedCnt AS skippedCnt, gm.joinedAt AS joinedAt
      FROM users AS u
      JOIN group_memberships AS gm
      ON u.id = gm.userId
      WHERE gm.groupId = ${groupId}`;

    return {
      name: group.name,
      description: group.description,
      manager: group.managerName,
      createdAt: group.createdAt,
      members: groupMembers
    };
  }

  // 그룹 멤버 추가
  // 해당 그룹을 만든 사람만 가능
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
      await this.prisma.groupMemberships
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

  async deleteUsersFromGroup(
    payload: JwtPayload,
    groupId: number,
    request: DeleteUsersFromGroupRequest
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

    // 삭제할 유저들의 id 조회
    const users = await this.prisma.users.findMany({
      where: { name: { in: request.names } },
      select: { id: true }
    });

    // id들만 추출
    const userIds = users.map((user) => user.id);

    // 해당 그룹에 없는 사람에 대한 요청이 들어와도
    // deleteMany는 무시하고 에러를 발생시키지 않음
    await this.prisma.groupMemberships.deleteMany({
      where: {
        groupId: groupId,
        userId: { in: userIds }
      }
    });
  }

  // 그룹 매니저 변경
  async updateGroupManager(
    payload: JwtPayload,
    groupId: number,
    newManagerName: string
  ): Promise<GroupSummaryResponse> {
    const group = await this.prisma.groups.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundException(groupId + " 그룹을 찾을 수 없습니다");
    }

    if (group.managerName !== payload.name) {
      throw new UnauthorizedException("해당 그룹의 매니저가 아닙니다");
    }

    const newManager = await this.prisma.users.findUnique({
      where: { name: newManagerName }
    });

    if (!newManager) {
      throw new NotFoundException(newManager + " 사용자를 찾을 수 없습니다");
    }

    const updatedGroup = await this.prisma.groups.update({
      where: {
        id: groupId
      },
      data: {
        managerId: newManager.id,
        managerName: newManagerName
      }
    });

    return {
      name: updatedGroup.name,
      manager: updatedGroup.managerName,
      createdAt: updatedGroup.createdAt
    };
  }

  async updateGroupDescription(
    payload: JwtPayload,
    groupId: number,
    newDesciption: string
  ): Promise<GroupSummaryResponse> {
    const group = await this.prisma.groups.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundException(groupId + " 그룹을 찾을 수 없습니다");
    }

    if (group.managerName !== payload.name) {
      throw new UnauthorizedException("해당 그룹의 매니저가 아닙니다");
    }

    const updatedGroup = await this.prisma.groups.update({
      where: {
        id: groupId
      },
      data: {
        description: newDesciption
      }
    });

    return {
      name: updatedGroup.name,
      manager: updatedGroup.managerName,
      createdAt: updatedGroup.createdAt
    };
  }
}
