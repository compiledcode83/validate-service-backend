import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTicketEventDto {
  @ApiProperty({
    example: 'John Doe Concert',
    required: true,
    description: 'Name of the event',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({
    example: '25edb6e5-499d-4194-b858-beb1ad6d9c41',
    required: true,
    description: 'ID of the event',
    minLength: 1,
    maxLength: 36,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(36)
  uuid: string;
}
