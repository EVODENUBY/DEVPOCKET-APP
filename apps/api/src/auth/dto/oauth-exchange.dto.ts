import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class OAuthExchangeDto {
  @ApiProperty({ description: 'One-time OAuth login code.' })
  @IsString()
  @Length(43, 43)
  @Matches(/^[A-Za-z0-9_-]+$/)
  code!: string;
}
