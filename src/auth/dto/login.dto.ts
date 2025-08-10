import { IsString, IsNotEmpty, MaxLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ example: "mintuchel", description: "백준 아이디" })
  boj_name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @ApiProperty({ example: "qwer1234!", description: "비밀번호" })
  password: string;
}
