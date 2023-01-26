import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTicketTransferDto } from './dto/create-ticket-transfer.dto';
import { TicketTransferService } from './ticket-transfer.service';
import { TicketTransferFilterDto } from './dto/ticket-transfer.filter.dto';
import { PagingResult } from 'typeorm-cursor-pagination';
import { JwtAuthGuard } from '@admin/auth/guards/jwt-auth.guard';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { TicketTransfer } from '@app/ticket-transfer/ticket-transfer.entity';
import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { RequestToBodyInterceptor } from '@app/common/interceptors/request-to-body.interceptor';

@ApiResponse(ApiResponseHelper.unauthorized())
@UseGuards(JwtAuthGuard)
@Controller('ticket-transfers')
export class TicketTransferController {
  constructor(private readonly ticketTransferService: TicketTransferService) {}

  @ApiOperation({ description: `Get ticket transfer operation by uuid` })
  @ApiResponse(ApiResponseHelper.success(TicketTransfer))
  @ApiResponse(ApiResponseHelper.notFound('Ticket transfer not found'))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<TicketTransfer> {
    const ticketTransfer = await this.ticketTransferService.findById(id);

    if (!ticketTransfer) {
      throw new NotFoundException('Ticket transfer not found');
    }

    return ticketTransfer;
  }

  @ApiOperation({ description: 'Get All ticket transfers' })
  @ApiResponse(ApiResponseHelper.success(PaginatedResult<TicketTransfer>))
  @Get()
  async findAllPaginated(@Query() searchParams: TicketTransferFilterDto): Promise<PagingResult<TicketTransfer>> {
    return this.ticketTransferService.findAllPaginated(searchParams);
  }

  @ApiOperation({ description: `Transfer ticket to another user` })
  @ApiResponse(ApiResponseHelper.success(TicketTransfer, HttpStatus.CREATED))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @UseInterceptors(ClassSerializerInterceptor, new RequestToBodyInterceptor('ticketProvider', 'ticketProvider'))
  @Post()
  async create(@Body() createDto: CreateTicketTransferDto): Promise<TicketTransfer> {
    return this.ticketTransferService.create(createDto);
  }
}
