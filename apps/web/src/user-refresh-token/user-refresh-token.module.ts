import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRefreshToken } from './user-refresh-token.entity';
import { UserRefreshTokenRepository } from './user-refresh-token.repository';
import { UserRefreshTokenService } from './user-refresh-token.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserRefreshToken])],
  providers: [UserRefreshTokenService, UserRefreshTokenRepository],
  exports: [UserRefreshTokenService],
})
export class UserRefreshTokenModule {}
