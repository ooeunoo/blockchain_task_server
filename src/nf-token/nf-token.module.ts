import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NFTokenService } from './nf-token.service';
import { NFTokenRepository } from '@libs/repository/nf-token/repository';
import { NFTokenController } from './nf-token.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NFTokenRepository])],
  providers: [NFTokenService],
  exports: [NFTokenService],
  controllers: [NFTokenController],
})
export class NFTokenModule {}
