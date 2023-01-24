import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class TicketTypeDto {
  @ApiProperty({
    example: '11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000',
    required: false,
    description: 'Required for primary market sale',
  })
  @IsUUID()
  ticketTypeUuid: string;

  @ApiProperty({ example: 3, required: false, description: 'Required for primary market sale' })
  @IsInt()
  @Min(1)
  @Max(25)
  quantity: number;
}
