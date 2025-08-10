import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateUserRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  boj_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  password: string;
}
