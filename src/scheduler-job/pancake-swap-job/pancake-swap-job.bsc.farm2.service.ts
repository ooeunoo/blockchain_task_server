import { Injectable } from '@nestjs/common';
import {
  EntityManager,
  getConnection,
  QueryRunner,
  TransactionManager,
} from 'typeorm';
import { getSafeERC20BalanceOf } from '@libs/helper/batch-contract';
import { div, isGreaterThanOrEqual, isZero, mul } from '@libs/helper/bignumber';
import { ONE_DAY_SECONDS, ONE_YEAR_DAYS, ZERO } from '@libs/helper/constant';
import { divideDecimals } from '@libs/helper/decimals';
import { getFarmAssetName } from '@libs/helper/naming';
import { isNull, isUndefined } from '@libs/helper/type';
import { PancakeSwapBSCService } from '../../defi/pancake-swap/pancake-swap.bsc.service';
import { FarmService } from '../../farm/farm.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { TokenService } from '../../token/token.service';
import { ID } from '../scheduler-job.constant';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { fillSequenceNumber } from '@libs/helper/array';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { SchedulerLoggerDTO } from '../../app-scheduler/scheduler-logger/scheduler-logger.dto';
import { FarmTemplate } from '../template/farm.template';
import { BigNumberish } from '@ethersproject/bignumber';

@Injectable()
export class PancakeSwapJobBSCFarm2Service extends FarmTemplate {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly farmService: FarmService,
    public readonly context: PancakeSwapBSCService,
  ) {
    super(
      ID.PANCAKE_SWAP.BSC.FARM2,
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

  networkPid(): Promise<BigNumberish> {
    return this.context.getFarm2TotalLength();
  }

  getFarmState(): Promise<any> {
    return null;
  }

  async registerFarm(
    farmInfo: {
      address: string;
      pid: number;
      stakeToken: {
        id: string;
        name: string;
        symbol: string;
        decimals: string;
      };
      rewardToken: {
        id: string;
        name: string;
        symbol: string;
        decimals: string;
      };
    },
    @TransactionManager() manger?: EntityManager,
  ): Promise<boolean> {
    const [stakeToken, rewardToken] = await Promise.all([
      this.tokenService.findToken({
        address: farmInfo.stakeToken.id,
        status: true,
        network: {
          chain_id: this.context.chainId,
          status: true,
        },
      }),
      this.tokenService.findToken({
        address: farmInfo.rewardToken.id,
        status: true,
        network: {
          chain_id: this.context.chainId,
          status: true,
        },
      }),
    ]);

    if (isUndefined(stakeToken) || isUndefined(rewardToken)) return false;

    await this.farmService.createFarm(
      {
        protocol: this.context.protocol,
        name: this.context.farm2Name,
        address: farmInfo.address,
        pid: farmInfo.pid,
        assets: getFarmAssetName([stakeToken], [rewardToken]),
        stake_tokens: [stakeToken],
        reward_tokens: [rewardToken],
      },
      manger,
    );
    return true;
  }

  async refreshFarm(
    farmInfo: { address: string; pid: number; reward: string },
    @TransactionManager() manager?: EntityManager,
  ): Promise<void> {
    const { id, stake_tokens, reward_tokens, status } =
      await this.farmService.findFarm(
        {
          protocol: this.context.protocol,
          name: this.context.farm2Name,
          address: farmInfo.address,
          pid: farmInfo.pid,
        },
        manager,
      );

    if (!status) return;

    const targetStakeToken = stake_tokens[0];
    const targetRewardToken = reward_tokens[0];

    // 총 유동 수량
    const liquidityAmount = divideDecimals(
      await getSafeERC20BalanceOf(
        this.context.provider,
        this.context.multiCallAddress,
        targetStakeToken.address,
        farmInfo.address,
      ),
      targetStakeToken.decimals,
    );

    // 총 유동 가치(USD)
    const liquidityValue = mul(liquidityAmount, targetStakeToken.price_value);

    // 1일 총 블록 갯수
    const blocksInOneDay = div(ONE_DAY_SECONDS, this.context.blockTimeSecond);

    // 1일 총 리워드 갯수
    const rewardAmountInOneDay = mul(blocksInOneDay, farmInfo.reward);

    // 1일 총 리워드 가치(USD)
    const rewardValueInOneDay = mul(
      rewardAmountInOneDay,
      targetRewardToken.price_value,
    );

    // 1년 총 리워드 가치(USD)
    const rewardValueInOneYear = mul(ONE_YEAR_DAYS, rewardValueInOneDay);

    // apr
    const farmApr = isZero(rewardValueInOneYear)
      ? ZERO
      : mul(div(rewardValueInOneYear, liquidityValue), 100);

    await this.farmService.updateFarm(
      {
        id,
      },
      {
        liquidity_amount: liquidityAmount.toString(),
        liquidity_value: liquidityValue.toString(),
        apr: farmApr.toString(),
        status: true,
      },
      manager,
    );
  }

  async run(logger: SchedulerLoggerDTO): Promise<void> {
    const loggerData: { [key: string]: any } = {
      total: null,
      failed: [],
    };
    try {
      const currentBlockNumber = await this.context.getBlockNumber();

      const networkPid = await this.networkPid();
      loggerData.total = networkPid.toString();

      const pids = fillSequenceNumber(Number(networkPid));

      const farmInfos = await this.context.getFarm2Infos(Number(networkPid));

      for await (const pid of pids) {
        let queryRunner: QueryRunner | null = null;

        try {
          const farmInfo = farmInfos[pid];

          if (isNull(farmInfo) || isUndefined(farmInfo)) return;

          const { id, stakeToken, earnToken, reward, endBlock } = farmInfo;

          const farm = await this.farmService.findFarm({
            protocol: this.context.protocol,
            name: this.context.farm2Name,
            address: id,
            pid,
          });

          if (isGreaterThanOrEqual(currentBlockNumber, endBlock)) {
            if (!isUndefined(farm)) {
              await this.farmService.updateFarm(
                { id: farm.id },
                { status: false },
              );
            }
            continue;
          }

          queryRunner = await getConnection().createQueryRunner();
          await queryRunner.connect();
          await queryRunner.startTransaction();

          let initialized = true;
          if (isUndefined(farm)) {
            initialized = await this.registerFarm(
              { address: id, pid, stakeToken, rewardToken: earnToken },
              queryRunner.manager,
            );
          }

          if (initialized) {
            await this.refreshFarm(
              { address: id, pid, reward },
              queryRunner.manager,
            );
          }
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
