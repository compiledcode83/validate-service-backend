import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { RefreshTokenValidator } from '../validators/refresh-token.validator';
import { IncomingHttpHeaders } from 'node:http';

export class RefreshTokensDto {
  @ApiProperty({ example: 'fingerprint', required: true, minLength: 8, maxLength: 64 })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  fingerprint: string;

  @ApiProperty({ example: 'F?2BVjaxNR-&hn%', required: true, minLength: 64, maxLength: 64 })
  @IsString()
  @MinLength(64)
  @MaxLength(64)
  @Validate(RefreshTokenValidator)
  refreshToken: string;

  @Allow()
  headers: IncomingHttpHeaders;

  @Allow()
  ip: string;
}
