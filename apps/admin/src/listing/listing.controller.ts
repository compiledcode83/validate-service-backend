import { Controller, HttpCode, HttpStatus, Get, Query, Post, Body } from '@nestjs/common';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListingService } from './listing.service';
import { ListingPaginatedResult } from '@app/listing/listing.types';
import { FindListingDto } from './dto/find-listing.dto';
import { CancelListingDto } from './dto/cancel-listing.dto';
import { ListingService as CommonListingService } from '@app/listing/listing.service';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('listings')
export class ListingController {
  constructor(
    private readonly listingService: ListingService,
    private readonly commonLisitingService: CommonListingService,
  ) {}

  @ApiOperation({ description: 'Find Listings' })
  @ApiResponse(ApiResponseHelper.success(ListingPaginatedResult))
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPaginated(@Query() searchParams: FindListingDto): Promise<ListingPaginatedResult> {
    return this.listingService.findAllPaginated(searchParams);
  }

  @ApiOperation({ description: 'Update Listing' })
  @ApiResponse(ApiResponseHelper.success(''))
  @HttpCode(HttpStatus.OK)
  @Post('cancel')
  async cancelListing(@Body() data: CancelListingDto) {
    return this.commonLisitingService.cancel(data.listingUuid, data.userUuid);
  }
}
