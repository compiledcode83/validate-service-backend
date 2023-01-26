import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Query,
  UseInterceptors,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@web/auth/decorators/public.decorator';
import { PagingResult } from 'typeorm-cursor-pagination';
import { FindTicketsDto } from './dto/find-tickets.dto';
import { FindUserTicketsDto } from './dto/find-user-tickets.dto';
import { TicketService } from './ticket.service';
import { JwtAuthGuard } from '@web/auth/guards/jwt-auth.guard';
import { AuthRequest } from '@web/auth/auth.types';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { Ticket } from '@app/ticket/ticket.entity';
import { ParamToQueryInterceptor } from '@app/common/interceptors/param-to-query.interceptor';
import { RequestToParamInterceptor } from '@app/common/interceptors/request-to-param.interceptor';
import { TicketPaginatedResult } from '@app/ticket/interfaces/ticket-paginated-result';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @ApiOperation({ description: `Find tickets by purchase id` })
  @ApiResponse(ApiResponseHelper.success(TicketPaginatedResult))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @Public()
  @UseInterceptors(ClassSerializerInterceptor, new ParamToQueryInterceptor('purchaseId', 'purchaseId'))
  @HttpCode(HttpStatus.OK)
  @Get(':purchaseId')
  async findAllPaginated(@Query() searchParams: FindTicketsDto): Promise<PagingResult<Ticket>> {
    const tickets = await this.ticketService.findAllPaginated(searchParams);

    if (!tickets?.data?.length) {
      throw new NotFoundException('Ticket not found');
    }

    return tickets;
  }

  @ApiResponse(ApiResponseHelper.unauthorized())
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: `Find tickets for the current user` })
  @ApiResponse(ApiResponseHelper.success(TicketPaginatedResult))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (user id is expected)']))
  @UseInterceptors(new RequestToParamInterceptor('user', 'user'))
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllUserPaginated(
    @Query() searchParams: FindUserTicketsDto,
    @Req() req: AuthRequest,
  ): Promise<PagingResult<Ticket>> {
    return this.ticketService.findAllUserPaginated(searchParams, req.user.id);
  }
}
