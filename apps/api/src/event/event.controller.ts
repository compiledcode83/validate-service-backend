import { ApiResponseHelper, AuthRequest, ParamToBodyInterceptor, RequestToBodyInterceptor } from '@app/common';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventsDto } from './dto/find-events.dto';
import { UpdateEventDto } from './dto/update-ticket-type.dto';
import { Event } from './event.entity';
import { EventService } from './event.service';
import { EventPaginatedResult } from './event.types';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiOperation({ description: `Find events` })
  @ApiResponse(ApiResponseHelper.success(EventPaginatedResult))
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPaginated(@Query() searchParams: FindEventsDto, @Req() req: AuthRequest): Promise<EventPaginatedResult> {
    return this.eventService.findAllPaginated(searchParams, req.ticketProvider.id);
  }

  @ApiOperation({ description: `Create a new event` })
  @ApiResponse(ApiResponseHelper.success(Event, HttpStatus.CREATED))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @UseInterceptors(ClassSerializerInterceptor, new RequestToBodyInterceptor('ticketProvider', 'ticketProvider'))
  @Post()
  async create(@Body() body: CreateEventDto): Promise<Event> {
    return this.eventService.create(body);
  }

  @ApiOperation({ description: `Update ticket type` })
  @ApiResponse(ApiResponseHelper.success(Event, HttpStatus.OK))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @UseInterceptors(
    ClassSerializerInterceptor,
    new RequestToBodyInterceptor('ticketProvider', 'ticketProvider'),
    new ParamToBodyInterceptor('uuid', 'uuid'),
  )
  @Patch(':uuid')
  async update(@Body() body: UpdateEventDto): Promise<Event> {
    return this.eventService.update(body);
  }
}
