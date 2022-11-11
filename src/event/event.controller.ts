import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthRequest } from '@src/auth/auth.types';
import { ApiResponseHelper } from '@src/common/helpers/api-response.helper';
import { FindEventsDto } from './dto/find-events.dto';
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
}
