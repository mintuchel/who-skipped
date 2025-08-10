import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateGroupRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  fine: number;
}
