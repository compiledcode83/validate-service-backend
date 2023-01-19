import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseHelper } from '@api/common/helpers/api-response.helper';
import { AuthRequest } from '@api/common/types/auth.request';
import { TicketProvider } from './ticket-provider.entity';
import { TicketProviderService } from './ticket-provider.service';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('ticket-providers')
export class TicketProviderController {
  constructor(private readonly ticketProviderService: TicketProviderService) {}

  @ApiOperation({ description: `Get current ticket provider profile` })
  @ApiResponse(ApiResponseHelper.success(TicketProvider))
  @UseInterceptors(ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @Get('profile')
  async getProfile(@Req() req: AuthRequest): Promise<TicketProvider> {
    return req.ticketProvider;
  }
}
