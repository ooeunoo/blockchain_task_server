import { Module } from '@nestjs/common';
import { TokenPriceSingleAMMService } from './token-price-job.single.amm.service';
import { TokenPriceSingleChainLinkService } from './token-price-job.single.chainlink.service';
import { TokenPriceMultiAMMService } from './token-price-job.multi.amm.service';
import { SchedulerModule } from '../../scheduler/scheduler.module';
import { TokenModule } from '../../token/token.module';
import { NetworkModule } from '../../network/network.module';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerModule } from '../../app-scheduler/scheduler-logger/scheduler-logger.module';

@Module({
  imports: [SchedulerModule, TokenModule, NetworkModule, SchedulerLoggerModule],
  providers: [
    SingletonSchedulerRegistry,
    TokenPriceSingleAMMService,
    TokenPriceMultiAMMService,
    TokenPriceSingleChainLinkService,
  ],
  exports: [
    TokenPriceSingleAMMService,
    TokenPriceMultiAMMService,
    TokenPriceSingleChainLinkService,
  ],
})
export class TokenPriceJobModule {}
