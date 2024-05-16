import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InteractionRepository } from '@libs/repository/interaction/repository';
import { InteractionService } from './interaction.service';
import { NetworkModule } from '../network/network.module';
import { InteractionController } from './interaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InteractionRepository]), NetworkModule],
  providers: [InteractionService],
  exports: [InteractionService],
  controllers: [InteractionController],
})
export class InteractionModule {}
