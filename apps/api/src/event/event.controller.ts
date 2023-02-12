import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { ParamToBodyInterceptor } from '@app/common/interceptors/param-to-body.interceptor';
import { RequestToBodyInterceptor } from '@app/common/interceptors/request-to-body.interceptor';
import { AuthRequest } from '@app/common/types/auth.request';
import { Event } from '@app/event/event.entity';
import { EventPaginatedResult } from '@app/event/event.types';
import { Locale } from '@app/translation/translation.types';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventsDto } from './dto/find-events.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { EventService } from './event.service';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiOperation({ description: `Find events` })
  @ApiResponse(ApiResponseHelper.success(EventPaginatedResult))
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPaginated(
    @Query() searchParams: FindEventsDto,
    @Req() req: AuthRequest,
    @I18n() i18n: I18nContext,
  ): Promise<EventPaginatedResult> {
    return this.eventService.findAllPaginated(searchParams, req.ticketProvider.id, i18n.lang as Locale);
  }

  @ApiOperation({ description: `Get event information` })
  @ApiResponse(ApiResponseHelper.success(Event))
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string, @I18n() i18n: I18nContext): Promise<Event> {
    const event = await this.eventService.findByUuid(uuid, i18n.lang as Locale);

    if (!event) {
      throw new NotFoundException();
    }

    return event;
  }

  @ApiOperation({ description: `Create a new event` })
  @ApiResponse(ApiResponseHelper.success(Event, HttpStatus.CREATED))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @UseInterceptors(ClassSerializerInterceptor, new RequestToBodyInterceptor('ticketProvider', 'ticketProvider'))
  @Post()
  async create(@Body() body: CreateEventDto, @I18n() i18n: I18nContext): Promise<Event> {
    return this.eventService.create(body, i18n.lang as Locale);
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
  async update(@Body() body: UpdateEventDto, @I18n() i18n: I18nContext): Promise<Event> {
    return this.eventService.update(body, i18n.lang as Locale);
  }
}
