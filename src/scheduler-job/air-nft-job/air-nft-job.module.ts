import { Module } from '@nestjs/common';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';
import { AirNftModule } from '../../defi/air-nft/air-nft.module';
import { NFTokenModule } from '../../nf-token/nf-token.module';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { TokenModule } from '../../token/token.module';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { AirNFTBSCNFTService } from './air-nft-job.bsc.nft.service';

@Module({
  imports: [
    AirNftModule,
    SchedulerModule,
    TokenModule,
    NFTokenModule,
    SchedulerLoggerModule,
  ],
  providers: [SingletonSchedulerRegistry, AirNFTBSCNFTService],
  exports: [AirNFTBSCNFTService],
})
export class AirNFTJobModule {}
