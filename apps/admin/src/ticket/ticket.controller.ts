import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TicketService } from './ticket.service';
import { UpdateTicketValidationDto } from './dto/update.ticket.validation.dto';
import { TicketFilterDto } from './dto/ticket.filter.dto';
import { RetryTicketMinting } from './dto/retry.minting.ticket.validation.dto';
import { JwtAuthGuard } from '@admin/auth/guards/jwt-auth.guard';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { Ticket } from '@app/ticket/ticket.entity';
import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { CreateTicketValidationDto } from './dto/create.ticket.validation.dto';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Locale } from '@app/translation/translation.types';

@ApiResponse(ApiResponseHelper.unauthorized())
@UseGuards(JwtAuthGuard)
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @ApiOperation({ description: `Create a ticket` })
  @ApiResponse(ApiResponseHelper.success(Ticket, HttpStatus.CREATED))
  @Post()
  async create(@Body() createTicketDto: CreateTicketValidationDto, @I18n() i18n: I18nContext) {
    return this.ticketService.create(createTicketDto, i18n.lang as Locale);
  }

  @ApiOperation({ description: `Update Ticket  properties` })
  @ApiResponse(ApiResponseHelper.success(Ticket, HttpStatus.OK))
  @ApiResponse(ApiResponseHelper.validationError(`Validation failed (uuid is expected)`))
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTicketDto: UpdateTicketValidationDto,
    @I18n() i18n: I18nContext,
  ) {
    return this.ticketService.update(id, updateTicketDto, i18n.lang as Locale);
  }

  @ApiOperation({ description: `Get All Tickets` })
  @ApiResponse(ApiResponseHelper.success(PaginatedResult<Ticket>))
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPaginated(
    @Query() searchParams: TicketFilterDto,
    @I18n() i18n: I18nContext,
  ): Promise<PaginatedResult<Ticket>> {
    return this.ticketService.findAllPaginated(searchParams, i18n.lang as Locale);
  }

  @ApiOperation({ description: `Get a ticket  by id` })
  @ApiResponse(ApiResponseHelper.success(Ticket))
  @ApiResponse(ApiResponseHelper.validationError(`Validation failed (uuid is expected)`))
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.findById(id);
  }

  @ApiOperation({ description: `Retry Minting of Ticket in case of error` })
  @ApiResponse(ApiResponseHelper.success(Ticket))
  @Post('/retry-minting')
  async retryMiniting(@Body() retryTicketMintingDto: RetryTicketMinting) {
    return this.ticketService.retryMinting(retryTicketMintingDto);
  }

  @ApiOperation({ description: `Delete a ticket s` })
  @ApiResponse(ApiResponseHelper.success(Ticket, HttpStatus.CREATED))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.ticketService.delete(id);
  }
}
