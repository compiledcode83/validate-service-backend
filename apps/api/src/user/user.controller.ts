import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { ParamToBodyInterceptor } from '@app/common/interceptors/param-to-body.interceptor';
import { RequestToBodyInterceptor } from '@app/common/interceptors/request-to-body.interceptor';
import { AuthRequest } from '@app/common/types/auth.request';
import { User } from '@app/user/user.entity';
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ description: `Get user by uuid` })
  @ApiResponse(ApiResponseHelper.success(User))
  @ApiResponse(ApiResponseHelper.notFound('User not found'))
  @ApiResponse(ApiResponseHelper.validationErrors(['Validation failed (uuid is expected)']))
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':uuid')
  async findOneByUuid(@Param('uuid', ParseUUIDPipe) uuid: string, @Req() req: AuthRequest): Promise<User> {
    const user = await this.userService.findByUuidAndProvider(uuid, req.ticketProvider.id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @ApiOperation({ description: `Update user by uuid` })
  @ApiResponse(ApiResponseHelper.success(User))
  @ApiResponse(ApiResponseHelper.validationErrors(['phoneNumber must be a valid phone number']))
  @UseInterceptors(
    new RequestToBodyInterceptor('ticketProvider', 'ticketProvider'),
    new ParamToBodyInterceptor('uuid', 'uuid'),
  )
  @Patch(':uuid')
  async update(@Body() body: UpdateUserDto): Promise<User> {
    return this.userService.update(body.uuid, body);
  }

  @ApiOperation({ description: `Create a new user` })
  @ApiResponse(ApiResponseHelper.success(User, HttpStatus.CREATED))
  @ApiResponse(ApiResponseHelper.validationErrors([`User with identifier 'user@example.com' already exists`]))
  @UseInterceptors(ClassSerializerInterceptor, new RequestToBodyInterceptor('ticketProvider', 'ticketProvider'))
  @Post()
  async create(@Body() body: CreateUserDto, @Req() req: AuthRequest): Promise<User> {
    return this.userService.create(body, req.ticketProvider.id);
  }
}
