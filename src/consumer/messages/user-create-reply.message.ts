import { User } from '@src/user/user.entity';

export class UserCreateReplyMessage {
  user: User;

  constructor(data: Partial<UserCreateReplyMessage>) {
    Object.assign(this, data);
  }
}
