import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminRefreshTokenService } from './admin-refresh-token.service';
import { AdminRefreshToken } from './admin-refresh-token.entity';
import { AdminRefreshTokenRepository } from './admin-refresh-token.repository';

@Module({
  imports: [TypeOrmModule.forFeature([AdminRefreshToken])],
  providers: [AdminRefreshTokenService, AdminRefreshTokenRepository],
  exports: [AdminRefreshTokenService],
})
export class AdminRefreshTokenModule {}
