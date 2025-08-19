import { IsArray, ArrayNotEmpty, IsString } from "class-validator";

export class DeleteUsersFromGroupRequest {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  names: string[];
}
