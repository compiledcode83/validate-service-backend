import { Injectable } from '@nestjs/common';
import { MessageRepository as CommonRepository } from '@app/message/message.repository';

@Injectable()
export class MessageRepository extends CommonRepository {}
