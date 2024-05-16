import { Module } from '@nestjs/common';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';
import { ApeSwapModule } from '../../defi/ape-swap/ape-swap.module';
import { FarmModule } from '../../farm/farm.module';
import { NFTokenModule } from '../../nf-token/nf-token.module';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { TokenModule } from '../../token/token.module';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { ApeSwapBSCFarmService } from './ape-swap-job.bsc.farm.service';
import { ApeSwapBSCNFTService } from './ape-swap-job.bsc.nft.service';
import { ApeSwapBSCPairService } from './ape-swap-job.bsc.pair.service';
import { ApeSwapMATICFarmJobService } from './ape-swap-job.matic.farm.service';
import { ApeSwapMATICPairService } from './ape-swap-job.matic.pair.service';

@Module({
  imports: [
    ApeSwapModule,
    SchedulerModule,
    TokenModule,
    FarmModule,
    SchedulerLoggerModule,
    NFTokenModule,
  ],
  providers: [
    SingletonSchedulerRegistry,
    ApeSwapBSCFarmService,
    ApeSwapBSCPairService,
    ApeSwapMATICFarmJobService,
    ApeSwapMATICPairService,
    ApeSwapBSCNFTService,
  ],
  exports: [
    ApeSwapBSCFarmService,
    ApeSwapBSCPairService,
    ApeSwapMATICFarmJobService,
    ApeSwapMATICPairService,
    ApeSwapBSCNFTService,
  ],
})
export class ApeSwapJobModule {}
