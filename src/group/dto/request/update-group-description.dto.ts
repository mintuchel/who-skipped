import { IsString, IsNotEmpty, MaxLength } from "class-validator";

export class UpdateGroupDescriptionRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  newDescription: string;
}
