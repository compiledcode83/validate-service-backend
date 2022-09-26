import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseHelper } from '@src/common/helpers/api-response.helper';
import { AuthRequest } from '@src/common/types/auth.request';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@ApiBearerAuth()
@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ description: `Get user by uuid` })
  @ApiResponse(ApiResponseHelper.success(User))
  @ApiResponse(ApiResponseHelper.notFound('Requested user not found'))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':uuid')
  async getUser(@Param('uuid', ParseUUIDPipe) uuid: string, @Req() req: AuthRequest): Promise<User> {
    const user = await this.userService.findByUuidAndProvider(uuid, req.ticketProvider.id);

    if (!user) {
      throw new NotFoundException('Requested user not found');
    }

    return user;
  }

  // @ApiOperation({ description: `Update user by uuid` })
  // @ApiResponse(ApiResponseHelper.success(User))
  // @Patch(':uuid')
  // async updateUser(@Body() body: UpdateUserDto): Promise<User> {
  //   // return this.userService.update(body);
  // }
}
