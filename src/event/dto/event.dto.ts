import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class EventDto {
  @ApiProperty({
    example: 'John Doe Concert',
    required: false,
    description: 'Description of the event',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  description: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    required: false,
    description: 'Image URL of the event',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  imageUrl: string;

  @ApiProperty({
    example: 'https://example.com',
    required: false,
    description: 'Website URL of the event',
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(1000)
  websiteUrl: string;
}
