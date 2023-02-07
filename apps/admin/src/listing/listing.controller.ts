import { Controller, HttpCode, HttpStatus, Get, Query, Patch, Param, ParseIntPipe } from '@nestjs/common';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListingService } from './listing.service';
import { ListingPaginatedResult } from '@app/listing/listing.types';
import { FindListingDto } from './dto/find-listing.dto';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('listing')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

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
  @Patch(':id')
  async cancelListing(@Param('id', ParseIntPipe) id: number) {
    return this.listingService.cancelListing(id);
  }
}
