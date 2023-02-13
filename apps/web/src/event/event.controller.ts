import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { Event } from '@app/event/event.entity';
import { EventPaginatedResult } from '@app/event/event.types';
import { Locale } from '@app/translation/translation.types';
import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@web/auth/decorators/public.decorator';
import { I18n, I18nContext } from 'nestjs-i18n';
import { FindEventsDto } from './dto/find-events.dto';
import { EventService } from './event.service';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiOperation({ description: `Find events` })
  @ApiResponse(ApiResponseHelper.success(EventPaginatedResult))
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get()
  async findAllPaginated(
    @Query() searchParams: FindEventsDto,
    @I18n() i18n: I18nContext,
  ): Promise<EventPaginatedResult> {
    return this.eventService.findAllPaginated(searchParams, i18n.lang as Locale);
  }

  @ApiOperation({ description: `Get event information` })
  @ApiResponse(ApiResponseHelper.success(Event))
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @Public()
  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string, @I18n() i18n: I18nContext): Promise<Event> {
    const event = await this.eventService.findByUuid(uuid, i18n.lang as Locale);

    if (!event) {
      throw new NotFoundException();
    }

    return event;
  }
}
