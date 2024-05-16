import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SingletonSchedulerRegistry } from '../scheduler-job/scheduler-job.registry';
import { SchedulerModule } from '../scheduler/scheduler.module';
import { MysqlConfigService } from '../common/mysql/mysql-config.service';
import { LoggerModule } from '../app/logger/logger.module';
import { SchedulerJobService } from './scheduler-job.service';

import { PancakeSwapJobModule } from './pancake-swap-job/pancake-swap-job.module';
import { ApeSwapJobModule } from './ape-swap-job/ape-swap-job.module';
import { TokenPriceJobModule } from './token-price-job/token-price-job.module';
import { InteractionJobModule } from './interaction-job/interaction.job.module';
import { AirNFTJobModule } from './air-nft-job/air-nft-job.module';
import { AutoFarmJobModule } from './auto-farm-job/auto-farm-job.module';
import { BiSwapJobModule } from './bi-swap-job/bi-swap-job.module';
import { VenusJobModule } from './venus-job/venus-job.module';
import { MdexJobModule } from './mdex-job/mdex-job.module';
import { SushiSwapJobModule } from './sushi-swap-job/sushi-swap-job.module';
import { BakerySwapJobModule } from './bakery-swap-job/bakery-swap-job.module';
import { WaultSwapJobModule } from './wault-swap-job/wault-swap-job.module';
import { KlaySwapJobModule } from './klay-swap-job/klay-swap-job.module';
import { QuickSwapJobModule } from './quick-swap-job/quick-swap-job.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useClass: MysqlConfigService }),
    LoggerModule,
    SchedulerModule,

    PancakeSwapJobModule,
    TokenPriceJobModule,
    InteractionJobModule,
    AirNFTJobModule,
    ApeSwapJobModule,
    AutoFarmJobModule,
    BiSwapJobModule,
    VenusJobModule,
    MdexJobModule,
    SushiSwapJobModule,
    BakerySwapJobModule,
    WaultSwapJobModule,
    KlaySwapJobModule,
    QuickSwapJobModule,
  ],
  providers: [SchedulerJobService, SingletonSchedulerRegistry],
  exports: [SchedulerJobService, SingletonSchedulerRegistry],
})
export class SchedulerJobModule {}
