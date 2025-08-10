import { PrismaService } from "prisma/prisma.service";
import { Injectable } from "@nestjs/common";

@Injectable()
export class GroupService {
  constructor(private readonly prismaService: PrismaService) {}
}
