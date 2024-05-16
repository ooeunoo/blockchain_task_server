import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from './token.service';
import { TokenController } from './token.controller';
import { TokenRepository } from '@libs/repository/token/repository';
@Module({
  imports: [TypeOrmModule.forFeature([TokenRepository])],
  providers: [TokenService],
  exports: [TokenService],
  controllers: [TokenController],
})
export class TokenModule {}
