import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { PaginatedResult } from '@app/common/pagination/pagination.types';
import { TicketProviderEncryptionKey } from '@app/ticket-provider-encryption-key/ticket-provider-encryption-key.entity';
import { Body, Controller, Get, HttpStatus, NotFoundException, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PagingResult } from 'typeorm-cursor-pagination';
import { CreateTicketProviderEncryptionKeyValidationDto } from './dto/create-ticket-provider-encryption-key.validation.dto';
import { TicketProviderEncryptionKeyFilterDto } from './dto/ticket-provider-encryption-key.filter.dto';
import { TicketProviderEncryptionKeyService } from './ticket-provider-encryption-key.service';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('ticket-provider-encryption-keys')
export class TicketProviderEncryptionKeyController {
  constructor(private readonly ticketProviderEncryptionKeyService: TicketProviderEncryptionKeyService) {}

  @ApiOperation({ description: `Get encryption key by version` })
  @ApiResponse(ApiResponseHelper.success(TicketProviderEncryptionKey))
  @ApiResponse(ApiResponseHelper.notFound('Encryption key not found'))
  @Get(':version/:ticketProviderId')
  async findOne(
    @Param('version', ParseIntPipe) version: number,
    @Param('ticketProviderId', ParseIntPipe) ticketProviderId: number,
  ): Promise<TicketProviderEncryptionKey> {
    const encryptionKey = await this.ticketProviderEncryptionKeyService.findByVersion(version, ticketProviderId);

    if (!encryptionKey) {
      throw new NotFoundException('Encryption key not found');
    }

    return encryptionKey;
  }

  @ApiOperation({ description: `Get all ticket provider api tokens with pagination` })
  @ApiResponse(ApiResponseHelper.success(PaginatedResult<TicketProviderEncryptionKey>))
  @Get()
  async findAllPaginated(
    @Query() searchParams: TicketProviderEncryptionKeyFilterDto,
  ): Promise<PagingResult<TicketProviderEncryptionKey>> {
    return this.ticketProviderEncryptionKeyService.findAllPaginated(searchParams);
  }

  @ApiOperation({ description: `Create new encryption key` })
  @ApiResponse(ApiResponseHelper.success(TicketProviderEncryptionKey, HttpStatus.CREATED))
  @Post()
  async create(
    @Body() createTicketProviderEncryptionKeyDto: CreateTicketProviderEncryptionKeyValidationDto,
  ): Promise<TicketProviderEncryptionKey> {
    return this.ticketProviderEncryptionKeyService.create(createTicketProviderEncryptionKeyDto);
  }
}
