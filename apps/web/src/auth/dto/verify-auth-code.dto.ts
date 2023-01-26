import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsIP, IsNotEmpty, IsPhoneNumber, IsString, MaxLength, Validate } from 'class-validator';
import { IncomingHttpHeaders } from 'node:http';
import { HeadersValidator } from '../validators/headers.validator';
import { UserExistsByPhoneNumberValidator } from '../validators/user-exists-by-phone-number.validator';

export class VerifyAuthCodeDto {
  @ApiProperty({ example: '+19071111111' })
  @IsNotEmpty()
  @IsPhoneNumber()
  @Validate(UserExistsByPhoneNumberValidator)
  phoneNumber: string;

  @ApiProperty({ example: 123456 })
  @IsNotEmpty()
  @IsInt()
  authCode: number;

  @ApiProperty({ example: '00000000-54b3-e7c7-0000-000046bffd97' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  fingerprint: string;

  @Validate(HeadersValidator)
  headers: IncomingHttpHeaders;

  @IsIP()
  ip: string;
}
