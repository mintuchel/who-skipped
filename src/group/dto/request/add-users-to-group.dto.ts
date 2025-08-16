import { IsArray, ArrayNotEmpty, IsString } from "class-validator";

export class AddUsersToGroupRequest {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  names: string[];
}
