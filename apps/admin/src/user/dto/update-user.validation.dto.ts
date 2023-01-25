import { UserStatus } from '@app/user/user.types';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateUserValidationDto {
  @ApiProperty({ example: 'John Bucks', required: true })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name: string;

  @ApiProperty({ example: 'example@domain.com', required: true })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email: string;

  @ApiProperty({
    example: 'https://img.new.livestream.com/events/00000000004f5dbd/7ffdcd50-2e4b-497a-acca-bc33070c3e12.jpg',
    required: false,
    maxLength: 2048,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(2048)
  photoUrl: string;

  @ApiProperty({ example: '011-971-55-000-0000', required: true })
  @IsOptional()
  @IsPhoneNumber()
  @MaxLength(255)
  phoneNumber: string;

  @ApiProperty({ example: UserStatus.Active, required: true, default: UserStatus.Active })
  @IsOptional()
  @IsEnum(UserStatus)
  status: UserStatus;
}
