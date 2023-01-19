import { User } from '@src/user/user.entity';

export class UserCreateReplyMessage {
  user: User;
  errorData?: string;

  constructor(data: Partial<UserCreateReplyMessage>) {
    Object.assign(this, data);
  }
}
