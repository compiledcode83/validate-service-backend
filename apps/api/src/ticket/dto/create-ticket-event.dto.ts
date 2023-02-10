import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

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
    example: 'John Doe Concert',
    required: true,
    description: 'Name of the event',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  eventUuid: string;
}
