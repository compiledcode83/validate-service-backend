import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseHelper } from '@src/common/helpers/api-response.helper';
import { RequestToBodyInterceptor } from '@src/common/interceptors/request-to-body.interceptor';
import { AuthRequest } from '@src/common/types/auth.request';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { Ticket } from './ticket.entity';
import { TicketService } from './ticket.service';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @ApiOperation({ description: `Get ticket by uuid` })
  @ApiResponse(ApiResponseHelper.success(Ticket))
  @ApiResponse(ApiResponseHelper.notFound('Ticket not found'))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':uuid')
  async findOne(@Param('uuid', ParseUUIDPipe) uuid: string, @Req() req: AuthRequest): Promise<Ticket> {
    const ticket = await this.ticketService.findByUuidAndProvider(uuid, req.ticketProvider.id);

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  @ApiOperation({ description: `Create a new ticket` })
  @ApiResponse(ApiResponseHelper.success(Ticket, HttpStatus.CREATED))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @UseInterceptors(ClassSerializerInterceptor, new RequestToBodyInterceptor('ticketProvider', 'ticketProvider'))
  @Post()
  async create(@Body() body: CreateTicketDto, @Req() req: AuthRequest): Promise<Ticket> {
    return this.ticketService.create(body, req.ticketProvider.id);
  }
}
