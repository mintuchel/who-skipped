import { IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateUserRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  nickname: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;
}
