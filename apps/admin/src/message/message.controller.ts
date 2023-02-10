import { Controller, HttpCode, HttpStatus, Get, Query, Param } from '@nestjs/common';
import { ApiResponseHelper } from '@app/common/helpers/api-response.helper';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MessageService } from './message.service';
import { MessagePaginatedResult } from '@app/message/message.types';
import { FindMessageDto } from './dto/find-message.dto';
import { Message } from '@app/message/message.entity';

@ApiResponse(ApiResponseHelper.unauthorized())
@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @ApiOperation({ description: 'Find Messages' })
  @ApiResponse(ApiResponseHelper.success(MessagePaginatedResult))
  @HttpCode(HttpStatus.OK)
  @Get()
  async findAllPaginated(@Query() searchParams: FindMessageDto): Promise<MessagePaginatedResult> {
    return this.messageService.findAllPaginated(searchParams);
  }

  @ApiOperation({ description: 'Find One Message' })
  @ApiResponse(ApiResponseHelper.success(Message))
  @HttpCode(HttpStatus.OK)
  @Get(':uuid')
  async findOne(@Param('uuid') uuid: string): Promise<Message> {
    return this.messageService.findOne(uuid);
  }
}
