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
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseHelper } from '@src/common/helpers/api-response.helper';
import { ParamToBodyInterceptor } from '@src/common/interceptors/param-to-body.interceptor';
import { RequestToBodyInterceptor } from '@src/common/interceptors/request-to-body.interceptor';
import { RequestToQueryInterceptor } from '@src/common/interceptors/request-to-query.interceptor';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { FindTicketTypesDto } from './dto/find-ticket-types.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { TicketType } from './ticket-type.entity';
import { TicketTypeService } from './ticket-type.service';
import { TicketTypePaginatedResult } from './ticket-type.types';

@Controller('ticket-types')
export class TicketTypeController {
  constructor(private readonly ticketTypeService: TicketTypeService) {}

  @ApiOperation({ description: `Find ticket types for the event` })
  @ApiResponse(ApiResponseHelper.success(TicketTypePaginatedResult))
  @UseInterceptors(ClassSerializerInterceptor, new RequestToQueryInterceptor('ticketProvider', 'ticketProvider'))
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPaginated(@Query() searchParams: FindTicketTypesDto): Promise<TicketTypePaginatedResult> {
    return this.ticketTypeService.findAllPaginated(searchParams);
  }

  @ApiOperation({ description: `Create a new ticket type` })
  @ApiResponse(ApiResponseHelper.success(TicketType, HttpStatus.CREATED))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @UseInterceptors(ClassSerializerInterceptor, new RequestToBodyInterceptor('ticketProvider', 'ticketProvider'))
  @Post()
  async create(@Body() body: CreateTicketTypeDto): Promise<TicketType> {
    return this.ticketTypeService.create(body);
  }

  @ApiOperation({ description: `Update ticket type` })
  @ApiResponse(ApiResponseHelper.success(TicketType, HttpStatus.OK))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @UseInterceptors(
    ClassSerializerInterceptor,
    new RequestToBodyInterceptor('ticketProvider', 'ticketProvider'),
    new ParamToBodyInterceptor('uuid', 'uuid'),
  )
  @Patch(':uuid')
  async update(@Body() body: UpdateTicketTypeDto): Promise<TicketType> {
    return this.ticketTypeService.update(body);
  }
}
