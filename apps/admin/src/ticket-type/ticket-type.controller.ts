import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { ParamToBodyInterceptor } from '@app/common/interceptors/param-to-body.interceptor';
import { RequestToBodyInterceptor } from '@app/common/interceptors/request-to-body.interceptor';
import { RequestToQueryInterceptor } from '@app/common/interceptors/request-to-query.interceptor';
import { CurrencyEnum } from '@app/common/types/currency.enum';
import { TicketType } from '@app/ticket-type/ticket-type.entity';
import { TicketTypePaginatedResult } from '@app/ticket-type/ticket-type.types';
import { Locale } from '@app/translation/translation.types';
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
import { I18n, I18nContext } from 'nestjs-i18n';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { FindTicketTypesDto } from './dto/find-ticket-types.dto';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { TicketTypeService } from './ticket-type.service';

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
  @Post()
  async create(@Body() body: CreateTicketTypeDto, @I18n() i18n: I18nContext): Promise<TicketType> {
    return this.ticketTypeService.create(body, i18n.lang as Locale);
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
  async update(@Body() body: UpdateTicketTypeDto, @I18n() i18n: I18nContext): Promise<TicketType> {
    return this.ticketTypeService.update(body, i18n.lang as Locale);
  }

  @Get('/currencies')
  async getCurrencies() {
    return CurrencyEnum;
  }
}
