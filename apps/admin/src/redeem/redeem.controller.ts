import { Controller, HttpCode, HttpStatus, Get, Query, Param } from '@nestjs/common';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RedeemService } from './redeem.service';
import { RedeemPaginatedResult } from '@app/redeem/redeem.types';
import { FindRedeemDto } from './dto/find-redeem.dto';
import { Redeem } from '@app/redeem/redeem.entity';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('redeems')
export class RedeemController {
  constructor(private readonly redeemService: RedeemService) {}

  @ApiOperation({ description: 'Find Listings' })
  @ApiResponse(ApiResponseHelper.success(RedeemPaginatedResult))
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPaginated(@Query() searchParams: FindRedeemDto): Promise<RedeemPaginatedResult> {
    return this.redeemService.findAllPaginated(searchParams);
  }

  @ApiOperation({ description: 'Find Listings' })
  @ApiResponse(ApiResponseHelper.success(Redeem))
  @HttpCode(HttpStatus.OK)
  @Get(':uuid')
  async getRedeemInfo(@Param('uuid') uuid: string): Promise<Redeem> {
    return this.redeemService.getRedeemInfo(uuid);
  }
}
