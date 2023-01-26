import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { ParamToBodyInterceptor } from '@app/common/interceptors/param-to-body.interceptor';
import { User } from '@app/user/user.entity';
import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UnauthorizedException,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthRequest } from '@web/auth/auth.types';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ description: `Update user by uuid` })
  @ApiResponse(ApiResponseHelper.success(User))
  @ApiResponse(ApiResponseHelper.validationErrors(['email must be a valid e-mail']))
  @UseInterceptors(new ParamToBodyInterceptor('uuid', 'uuid'))
  @Patch(':uuid')
  async update(@Req() req: AuthRequest, @Body() body: UpdateUserDto): Promise<User> {
    if (req.user.uuid !== body.uuid) {
      throw new UnauthorizedException();
    }

    return this.userService.update(body.uuid, body);
  }

  @ApiOperation({ description: `Get user by uuid` })
  @ApiResponse(ApiResponseHelper.success(User))
  @Get(':uuid')
  async findOne(@Req() req: AuthRequest, @Param('uuid', ParseUUIDPipe) uuid: string): Promise<User> {
    if (req.user.uuid !== uuid) {
      throw new UnauthorizedException();
    }

    return this.userService.findByUuid(uuid);
  }
}
