import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateEventValidationDto {
  @ApiProperty({ example: 'John Bucks', required: true })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  name: string;
}
