import { Controller, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OutboxService } from './outbox.service';
import { OutboxPaginatedResult } from '@app/outbox/outbox.types';
import { FindOutboxDto } from './dto/find-outbox.dto';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('outbox')
export class OutboxController {
  constructor(private readonly outboxService: OutboxService) {}

  @ApiOperation({ description: 'Find Events' })
  @ApiResponse(ApiResponseHelper.success(OutboxPaginatedResult))
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPaginated(@Query() searchParams: FindOutboxDto): Promise<OutboxPaginatedResult> {
    return this.outboxService.findAllPaginated(searchParams);
  }
}
