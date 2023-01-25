import { ApiProperty } from '@nestjs/swagger';
import { Allow, IsEmail, IsString, MaxLength, MinLength, Validate } from 'class-validator';
import { IncomingHttpHeaders } from 'node:http';
import { HeadersValidator } from '../validators/headers.validator';

export class LoginDto {
  @ApiProperty({ example: 'email@example.com', required: true })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'fingerprint', required: true, minLength: 1, maxLength: 255 })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  password: string;

  @ApiProperty({ example: 'fingerprint', required: true, minLength: 8, maxLength: 64 })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  fingerprint: string;

  @Validate(HeadersValidator)
  headers: IncomingHttpHeaders;

  @Allow()
  ip: string;
}
