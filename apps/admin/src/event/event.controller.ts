import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseInterceptors,
  Post,
  Body,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FindEventsDto } from './dto/find-events.dto';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { EventPaginatedResult } from '@app/event/event.types';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiOperation({ description: `Find events` })
  @ApiResponse(ApiResponseHelper.success(EventPaginatedResult))
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPaginated(@Query() searchParams: FindEventsDto): Promise<EventPaginatedResult> {
    return this.eventService.findAllPaginated(searchParams);
  }

  @ApiOperation({ description: 'create a new event' })
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @Post()
  async create(@Body() eventCreateDto: CreateEventDto) {
    return this.eventService.createOrInsert(
      eventCreateDto.name,
      eventCreateDto.ticketProviderId,
      eventCreateDto.description,
      eventCreateDto.imageUrl,
    );
  }
}
