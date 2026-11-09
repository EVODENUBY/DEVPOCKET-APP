import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class RefreshDto {
  @ApiProperty({ description: 'Opaque 256-bit refresh token.' })
  @IsString()
  @Length(43, 43)
  @Matches(/^[A-Za-z0-9_-]+$/)
  refreshToken!: string;
}
