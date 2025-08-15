import { IsArray, ArrayNotEmpty, IsString } from "class-validator";

export class AddUsersToGroupRequest {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  bojNameList: string[];
}
