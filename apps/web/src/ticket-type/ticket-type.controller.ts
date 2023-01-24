import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from '@web/auth/decorators/public.decorator';
import { TicketTypeService } from './ticket-type.service';
import { FindTicketTypesDto } from './dto/find-ticket-types.dto';
import { TicketTypePaginatedResult } from '@app/ticket-type/ticket-type.types';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';

@Controller('ticket-types')
export class TicketTypeController {
  constructor(private readonly ticketTypeService: TicketTypeService) {}

  @ApiOperation({ description: `Get ticket types` })
  @ApiResponse(ApiResponseHelper.success(TicketTypePaginatedResult))
  @Public()
  @Get()
  async findAllPaginated(@Query() searchParams: FindTicketTypesDto) {
    return this.ticketTypeService.findAllPaginated(searchParams);
  }
}
