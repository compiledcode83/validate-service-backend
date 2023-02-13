import {
  Controller,
  Get,
  Query,
  HttpStatus,
  Post,
  Body,
  UseGuards,
  Param,
  ClassSerializerInterceptor,
  UseInterceptors,
  HttpCode,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ListingService } from './listing.service';
import { ListingDto } from './dto/listing.filter.dto';
import { ListingPaginatedResult } from './interfaces/listing-paginated-result';
import { ListingCreateValidateDto } from './dto/listing.create.dto';
import { JwtAuthGuard } from '@web/auth/guards/jwt-auth.guard';
import { ListingCancelDto } from './dto/listing.cancel.dto';
import { Public } from '@web/auth/decorators/public.decorator';
import { AuthRequest } from '@web/auth/auth.types';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { Listing } from '@app/listing/listing.entity';
import { RequestToParamInterceptor } from '@app/common/interceptors/request-to-param.interceptor';

@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  @ApiOperation({ description: `Get listing by filters` })
  @ApiResponse(ApiResponseHelper.success(ListingPaginatedResult))
  @Public()
  @Get()
  async findAllPaginated(@Query() searchParams: ListingDto) {
    return this.listingService.findAllPaginated(searchParams);
  }

  @ApiResponse(ApiResponseHelper.unauthorized())
  @UseGuards(JwtAuthGuard)
  @ApiOperation(ApiResponseHelper.validationErrors(['Cannot Put on Sale.Ticket is in redeeming process']))
  @ApiOperation({ description: `Add new listing` })
  @ApiResponse(ApiResponseHelper.success(Listing, HttpStatus.CREATED))
  @Post()
  async create(@Req() req: AuthRequest, @Body() createListingDto: ListingCreateValidateDto) {
    return this.listingService.createListing(createListingDto, req.user.id);
  }

  @ApiResponse(ApiResponseHelper.unauthorized())
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ description: `Cancel Listing by id` })
  @ApiResponse(ApiResponseHelper.success(''))
  @ApiResponse(
    ApiResponseHelper.validationErrors([
      'Validation failed (numeric string is expected)',
      "User doesn't have an active listing with this id",
    ]),
  )
  @UseInterceptors(new RequestToParamInterceptor('user', 'user'), ClassSerializerInterceptor)
  @HttpCode(HttpStatus.OK)
  @Post(':listingUuid/cancel')
  async cancel(@Param() params: ListingCancelDto) {
    return this.listingService.cancel(params.listingUuid, params.user.uuid);
  }
}
