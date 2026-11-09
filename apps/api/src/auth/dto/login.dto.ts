import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'dev@example.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  email!: string;

  @ApiProperty({ format: 'password', maxLength: 1024 })
  @IsString()
  @MinLength(1)
  @MaxLength(1024)
  password!: string;
}
