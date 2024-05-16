import { BigNumberish } from '@ethersproject/bignumber';
import { Injectable } from '@nestjs/common';
import {
  EntityManager,
  getConnection,
  QueryRunner,
  TransactionManager,
} from 'typeorm';
import { fillSequenceNumber } from '@libs/helper/array';
import {
  getSafeCheckCA,
  getSafeERC20BalanceOf,
} from '@libs/helper/batch-contract';
import { add, div, isZero, mul } from '@libs/helper/bignumber';
import { getFarmAssetName } from '@libs/helper/naming';
import { isNull, isUndefined } from '@libs/helper/type';
import { ApeSwapMATICService } from '../../defi/ape-swap/ape-swap.matic.service';
import { FarmService } from '../../farm/farm.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { Token } from '@libs/repository/token/entity';
import { TokenService } from '../../token/token.service';
import { ID } from '../scheduler-job.constant';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { divideDecimals } from '../../../libs/helper/src/decimals';
import {
  ONE_YEAR_SECONDS,
  ZERO,
  ZERO_ADDRESS,
} from '../../../libs/helper/src/constant';
import BigNumber from 'bignumber.js';
import { FarmTemplate } from '../template/farm.template';
import { SchedulerLoggerDTO } from '../../app-scheduler/scheduler-logger/scheduler-logger.dto';

@Injectable()
export class ApeSwapMATICFarmJobService extends FarmTemplate {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly farmService: FarmService,
    public readonly context: ApeSwapMATICService,
  ) {
    super(
      ID.APE_SWAP.MATIC.FARM,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
      tokenService,
      farmService,
      context,
    );
  }

  onModuleInit(): Promise<void> {
    return;
  }

  async networkPid(): Promise<BigNumberish> {
    return this.context.getFarmTotalLength();
  }

  async getFarmState(farmInfo: {
    rewardPerSecond: BigNumberish;
    rewarder: string;
    rewarderRewardToken: Token;
  }): Promise<{ rewardValueInOneYear: BigNumber }> {
    const baseRewardAmountInOneSecond = divideDecimals(
      farmInfo.rewardPerSecond,
      this.getRewardToken().decimals,
    );

    const baseRewardValueInOneSecond = mul(
      baseRewardAmountInOneSecond,
      this.getRewardToken().price_value,
    );

    const baseRewardValueInOneYear = mul(
      baseRewardValueInOneSecond,
      ONE_YEAR_SECONDS,
    );

    // 추가 리워드
    let rewarderRewardValueInOneYear = ZERO;
    if (
      farmInfo.rewarder !== ZERO_ADDRESS &&
      !isUndefined(farmInfo.rewarderRewardToken)
    ) {
      const rewarderRewardPerSecond =
        await this.context.getFarmRewarderRewardPerSecond(farmInfo.rewarder);

      const rewarderRewardAmountInOneSecond = divideDecimals(
        rewarderRewardPerSecond,
        farmInfo.rewarderRewardToken.decimals,
      );

      const rewarderRewardValueInOneSecond = mul(
        rewarderRewardAmountInOneSecond,
        farmInfo.rewarderRewardToken.price_value,
      );

      rewarderRewardValueInOneYear = mul(
        rewarderRewardValueInOneSecond,
        ONE_YEAR_SECONDS,
      );
    }

    const rewardValueInOneYear = add(
      baseRewardValueInOneYear,
      rewarderRewardValueInOneYear,
    );

    return { rewardValueInOneYear };
  }

  async registerFarm(
    farmInfo: {
      pid: number;
      lpToken: string;
      rewarder: string;
      rewarderRewardToken: Token;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<boolean> {
    const stakeToken: Token = await this.tokenService.findToken(
      {
        address: farmInfo.lpToken,
        status: true,
        network: { chain_id: this.context.chainId, status: true },
      },
      manager,
    );

    if (isUndefined(stakeToken)) {
      return false;
    }

    if (isUndefined(farmInfo.rewarderRewardToken)) {
      return false;
    }

    const rewardTokens = [this.getRewardToken(), farmInfo.rewarderRewardToken];

    await this.farmService.createFarm(
      {
        protocol: this.context.protocol,
        name: this.context.farmName,
        address: this.context.farmAddress,
        pid: farmInfo.pid,
        assets: getFarmAssetName([stakeToken], rewardTokens),
        stake_tokens: [stakeToken],
        reward_tokens: rewardTokens,
        data: JSON.stringify({ rewarder: farmInfo.rewarder }),
      },
      manager,
    );
    return true;
  }

  async refreshFarm(
    farmInfo: {
      pid: number;
      allocPoint: BigNumberish;
      rewarder: string;
      rewarderRewardToken: Token;
    },
    farmState: {
      totalAllocPoint: BigNumberish;
      rewardPerSecond: BigNumberish;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<void> {
    const { rewardValueInOneYear } = await this.getFarmState({
      rewarder: farmInfo.rewarder,
      rewarderRewardToken: farmInfo.rewarderRewardToken,
      rewardPerSecond: farmState.rewardPerSecond,
    });

    const { id, stake_tokens, status } = await this.farmService.findFarm(
      {
        protocol: this.context.protocol,
        name: this.context.farmName,
        address: this.context.farmAddress,
        pid: farmInfo.pid,
      },
      manager,
    );

    if (!status) return;

    const targetStakeToken = stake_tokens[0];

    const liquidityAmount = divideDecimals(
      await getSafeERC20BalanceOf(
        this.context.provider,
        this.context.multiCallAddress,
        targetStakeToken.address,
        this.context.farmAddress,
      ),
      targetStakeToken.decimals,
    );

    const liquidityValue = mul(liquidityAmount, targetStakeToken.price_value);

    const sharePointOfFarm = div(
      farmInfo.allocPoint,
      farmState.totalAllocPoint,
    );

    const allocatedRewardValueInOneYear = mul(
      rewardValueInOneYear,
      sharePointOfFarm,
    );

    const farmApr =
      isZero(allocatedRewardValueInOneYear) || isZero(liquidityValue)
        ? ZERO
        : mul(div(allocatedRewardValueInOneYear, liquidityValue), 100);

    await this.farmService.updateFarm(
      {
        id,
      },
      {
        liquidity_amount: liquidityAmount.toString(),
        liquidity_value: liquidityValue.toString(),
        apr: farmApr.toString(),
        data: JSON.stringify({ rewarder: farmInfo.rewarder }),
        status: true,
      },
      manager,
    );
  }

  async run(logger?: SchedulerLoggerDTO): Promise<void> {
    const loggerData: { [key: string]: any } = {
      total: null,
      failed: [],
    };
    try {
      const networkPid = await this.networkPid();
      loggerData.total = networkPid.toString();

      const pids = fillSequenceNumber(Number(networkPid));

      const farmInfos = await this.context.getFarmInfos(pids);

      const [totalAllocPoint, rewardPerSecond] = await Promise.all([
        this.context.getFarmTotalAllocPoint(),
        this.context.getFarmRewardPerSecond(),
      ]);

      for await (const pid of pids) {
        let queryRunner: QueryRunner | null = null;

        try {
          const farm = await this.farmService.findFarm({
            protocol: this.context.protocol,
            name: this.context.farmName,
            pid,
          });

          const farmInfo = farmInfos[pid];

          if (isNull(farmInfo)) continue;

          const { allocPoint, lpToken, rewarder } = farmInfo;

          if (isZero(allocPoint)) {
            if (!isUndefined(farm)) {
              await this.farmService.updateFarm(
                { id: farm.id },
                { status: false },
              );
            }
            continue;
          }

          const isValidRewarder = await getSafeCheckCA(
            this.context.provider,
            this.context.multiCallAddress,
            farmInfo.rewarder,
          );

          let rewarderRewardTokenAddress;
          let rewarderRewardToken;

          if (isValidRewarder) {
            rewarderRewardTokenAddress =
              await this.context.getFarmRewarderRewardToken(rewarder);

            rewarderRewardToken = await this.tokenService.findToken({
              address: rewarderRewardTokenAddress,
              status: true,
              network: {
                chain_id: this.context.chainId,
                status: true,
              },
            });
          }

          queryRunner = await getConnection().createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();

          let initialized = true;
          if (isUndefined(farm)) {
            initialized = await this.registerFarm(
              { pid, lpToken, rewarder, rewarderRewardToken },
              queryRunner.manager,
            );
          }

          if (initialized) {
            await this.refreshFarm(
              {
                pid,
                allocPoint,
                rewarder,
                rewarderRewardToken,
              },
              {
                totalAllocPoint,
                rewardPerSecond,
              },
              queryRunner.manager,
            );
          }

          await queryRunner.commitTransaction();
        } catch (e) {
          if (!isNull(queryRunner) && queryRunner.isTransactionActive) {
            await queryRunner.rollbackTransaction();
          }
          loggerData.failed.push({
            pid,
            error: JSON.stringify(e, SchedulerLoggerDTO.errorToJSON),
          });
        } finally {
          if (!isNull(queryRunner) && !queryRunner?.isReleased) {
            await queryRunner.release();
          }
        }
      }
    } catch (e) {
      this.errorHandler(e);
    } finally {
      if (logger) {
        logger.setData(loggerData);
      }
    }
  }
}
