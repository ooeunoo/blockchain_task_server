import { BigNumber } from '@ethersproject/bignumber';
import { Injectable } from '@nestjs/common';
import {
  EntityManager,
  getConnection,
  QueryRunner,
  TransactionManager,
} from 'typeorm';
import { isZeroAddress } from '@libs/helper/address';
import { getSafeERC20BalanceOf } from '@libs/helper/batch-contract';
import { add, div, mul, sub, toFixed } from '@libs/helper/bignumber';
import { ONE_DAY_SECONDS, ONE_YEAR_DAYS } from '@libs/helper/constant';
import { divideDecimals } from '@libs/helper/decimals';
import { isNull, isUndefined } from '@libs/helper/type';
import { VenusBSCService } from '../../defi/venus/venus.bsc.service';
import { LendingService } from '../../lending/lending.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { Token } from '@libs/repository/token/entity';
import { TokenService } from '../../token/token.service';
import { SchedulerJobBase } from '../scheduler-job.base';
import { ID } from '../scheduler-job.constant';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { SchedulerLoggerDTO } from '../../app-scheduler/scheduler-logger/scheduler-logger.dto';

@Injectable()
export class VenusJobBSCLendingService extends SchedulerJobBase {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly lendingService: LendingService,
    public readonly context: VenusBSCService,
  ) {
    super(
      ID.VENUS.BSC.LENDING,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
    );
  }

  onModuleInit(): Promise<void> {
    return;
  }

  async registerLendingMarket(
    marketInfo: { token: Token; address: string },
    @TransactionManager() manager?: EntityManager,
  ): Promise<boolean> {
    if (isUndefined(marketInfo.token)) return false;

    await this.lendingService.createLending(
      {
        protocol: this.context.protocol,
        token: marketInfo.token,
        address: marketInfo.address,
      },
      manager,
    );
    return true;
  }

  async refreshLendingMarket(
    marketInfo: {
      token: Token;
      address: string;
      supplyRatePerBlock: BigNumber;
      borrowRatePerBlock: BigNumber;
      collateralFactorMantissa: BigNumber;
      reserveFactorMantissa: BigNumber;
      totalBorrows: BigNumber;
      totalReserves: BigNumber;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<void> {
    /**
     * Liquidity
     */
    const marketLiquidity = isZeroAddress(marketInfo.token.address)
      ? await this.context.getBalance(marketInfo.address)
      : await getSafeERC20BalanceOf(
          this.context.provider,
          this.context.multiCallAddress,
          marketInfo.token.address,
          marketInfo.address,
        );

    const liquidityAmount = divideDecimals(
      marketLiquidity.toString(),
      marketInfo.token.decimals,
    );

    const liquidityValue = mul(liquidityAmount, marketInfo.token.price_value);

    /**
     * Borrow
     */
    const borrowAmount = divideDecimals(marketInfo.totalBorrows, 18);
    const borrowValue = mul(borrowAmount, marketInfo.token.price_value);

    /**
     * Reserve
     */
    const reserveAmount = divideDecimals(marketInfo.totalReserves, 18);
    const reserveValue = mul(reserveAmount, marketInfo.token.price_value);

    /**
     * Supply
     */
    const supplyAmount = sub(add(liquidityAmount, borrowAmount), reserveAmount);

    const supplyValue = mul(supplyAmount, marketInfo.token.price_value);

    /**
     * Blocks One Year
     */
    const blocksInOneYear = mul(
      div(ONE_DAY_SECONDS, this.context.blockTimeSecond),
      ONE_YEAR_DAYS,
    );

    /**
     * Supply, Borrow Rate
     */
    const supplyRate = divideDecimals(marketInfo.supplyRatePerBlock, 18);
    const borrowRate = divideDecimals(marketInfo.borrowRatePerBlock, 18);

    /**
     * Supply, Borrow Apr
     */
    const supplyApr = mul(mul(supplyRate, blocksInOneYear), 100);
    const borrowApr = mul(mul(borrowRate, blocksInOneYear), 100);

    /**
     * Collateral, Reserve Factor
     */
    const collateralFactor = mul(
      toFixed(divideDecimals(marketInfo.collateralFactorMantissa, 18)),
      100,
    );

    const reserveFactor = mul(
      toFixed(divideDecimals(marketInfo.reserveFactorMantissa, 18)),
      100,
    );

    await this.lendingService.updateLending(
      {
        protocol: this.context.protocol,
        token: marketInfo.token,
        address: marketInfo.address,
      },
      {
        liquidity_amount: liquidityAmount.toString(),
        liquidity_value: liquidityValue.toString(),
        supply_amount: supplyAmount.toString(),
        supply_value: supplyValue.toString(),
        supply_apr: supplyApr.toString(),
        borrow_amount: borrowAmount.toString(),
        borrow_value: borrowValue.toString(),
        borrow_apr: borrowApr.toString(),
        reserve_amount: reserveAmount.toString(),
        reserve_value: reserveValue.toString(),
        collateral_factor: collateralFactor.toString(),
        reserve_factor: reserveFactor.toString(),
        status: true,
      },
      manager,
    );
  }

  async run(logger: SchedulerLoggerDTO): Promise<void> {
    const loggerData: { [key: string]: any } = {
      total: null,
    };
    try {
      const markets = await this.context.getLendingAllMarkets();
      loggerData.total = markets.length;

      for await (const market of markets) {
        let queryRunner: QueryRunner | null = null;

        try {
          const {
            underlying,
            supplyRatePerBlock,
            borrowRatePerBlock,
            totalBorrows,
            totalReserves,
            reserveFactorMantissa,
            market: { isListed, collateralFactorMantissa },
          } = await this.context.getLendingMarketInfos(market);

          const lendingMarketToken = await this.tokenService.findToken({
            network: this.context.network,
            address: underlying,
            status: true,
          });

          if (isUndefined(lendingMarketToken)) continue;

          const lendingMarket = await this.lendingService.findLending({
            protocol: this.context.protocol,
            token: lendingMarketToken,
            address: market,
          });

          if (!isListed) {
            if (!isUndefined(lendingMarket)) {
              await this.lendingService.updateLending(
                {
                  protocol: this.context.protocol,
                  token: lendingMarketToken,
                  address: market,
                },
                { status: false },
              );
              continue;
            }
          }

          queryRunner = await getConnection().createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();

          let initialized = true;
          if (isUndefined(lendingMarket)) {
            initialized = await this.registerLendingMarket(
              {
                token: lendingMarketToken,
                address: market,
              },
              queryRunner.manager,
            );
          }

          if (initialized) {
            await this.refreshLendingMarket(
              {
                token: lendingMarketToken,
                address: market,
                supplyRatePerBlock,
                borrowRatePerBlock,
                collateralFactorMantissa,
                reserveFactorMantissa,
                totalBorrows,
                totalReserves,
              },
              queryRunner.manager,
            );
          }

          await queryRunner.commitTransaction();
        } catch (e) {
          if (!isNull(queryRunner) && queryRunner.isTransactionActive) {
            await queryRunner.rollbackTransaction();
          }
        } finally {
          if (!isNull(queryRunner) && !queryRunner?.isReleased) {
            await queryRunner.release();
          }
        }
      }
    } catch (e) {
      this.errorHandler(e);
    } finally {
      logger.setData(loggerData);
    }
  }
}
