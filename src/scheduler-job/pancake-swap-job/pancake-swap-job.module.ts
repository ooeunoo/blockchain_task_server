import { Module } from '@nestjs/common';
import { TokenModule } from '../../token/token.module';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { FarmModule } from '../../farm/farm.module';
import { PancakeSwapModule } from '../../defi/pancake-swap/pancake-swap.module';
import { PancakeSwapBSCPairService } from './pancake-swap-job.bsc.pair.service';
import { PancakeSwapBSCFarmService } from './pancake-swap-job.bsc.farm.service';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { PancakeSwapJobBSCFarm2Service } from './pancake-swap-job.bsc.farm2.service';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';
import { NFTokenModule } from '../../nf-token/nf-token.module';
import { PancakeSwapBSCNFTService } from './pancake-swap-job.bsc.nft.service';
import { PancakeSwapBSCNFT2Service } from './pancake-swap-job.bsc.nft2.service';
import { PancakeSwapBSCNFT3Service } from './pancake-swap-job.bsc.nft3.service';
import { PancakeSwapBSCNFT4Service } from './pancake-swap-job.bsc.nft4.service';
import { PancakeSwapBSCNFT5Service } from './pancake-swap-job.bsc.nft5.service';

@Module({
  imports: [
    PancakeSwapModule,
    SchedulerModule,
    TokenModule,
    FarmModule,
    SchedulerLoggerModule,
    NFTokenModule,
  ],
  providers: [
    SingletonSchedulerRegistry,
    PancakeSwapBSCFarmService,
    PancakeSwapBSCPairService,
    PancakeSwapJobBSCFarm2Service,
    PancakeSwapBSCNFTService,
    PancakeSwapBSCNFT2Service,
    PancakeSwapBSCNFT3Service,
    PancakeSwapBSCNFT4Service,
    PancakeSwapBSCNFT5Service,
  ],
  exports: [
    PancakeSwapBSCFarmService,
    PancakeSwapBSCPairService,
    PancakeSwapBSCNFTService,
    PancakeSwapBSCNFT2Service,
    PancakeSwapBSCNFT3Service,
    PancakeSwapBSCNFT4Service,
    PancakeSwapBSCNFT5Service,
  ],
})
export class PancakeSwapJobModule {}
