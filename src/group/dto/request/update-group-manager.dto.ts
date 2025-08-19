import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class UpdateGroupManagerRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  newManagerName: string;
}
