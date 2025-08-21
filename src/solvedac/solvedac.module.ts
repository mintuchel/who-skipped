import { Module } from "@nestjs/common";
import { SolvedAcService } from "./solvedac.service";

@Module({
  providers: [SolvedAcService],
  exports: [SolvedAcService]
})
export class SolvedAcModule {}
