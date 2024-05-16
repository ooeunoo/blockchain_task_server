import { BigNumberish } from '@ethersproject/bignumber';
import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
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
import { div, isZero, mul } from '@libs/helper/bignumber';
import { ONE_DAY_SECONDS, ONE_YEAR_DAYS, ZERO } from '@libs/helper/constant';
import { divideDecimals } from '@libs/helper/decimals';
import { getFarmAssetName } from '@libs/helper/naming';
import { isNull, isUndefined } from '@libs/helper/type';
import { FarmService } from '../../farm/farm.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { Token } from '@libs/repository/token/entity';
import { TokenService } from '../../token/token.service';
import { ID } from '../scheduler-job.constant';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { SchedulerLoggerDTO } from '../../app-scheduler/scheduler-logger/scheduler-logger.dto';
import { FarmTemplate } from '../template/farm.template';
import { BakerySwapBSCService } from '../../defi/bakery-swap/bakery-swap.bsc.service';

@Injectable()
export class BakerySwapBSCFarmService extends FarmTemplate {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly farmService: FarmService,
    public readonly context: BakerySwapBSCService,
  ) {
    super(
      ID.BAKERY_SWAP.BSC.FARM,
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

  async getFarmState(): Promise<{
    totalAllocPoint: BigNumberish;
    rewardValueInOneYear: BigNumber;
  }> {
    const [totalAllocPoint, rewardPerBlock] = await Promise.all([
      this.context.getFarmTotalAllocPoint(),
      this.context.getFarmRewardPerBlock(),
    ]);

    // 블록 당 리워드 갯수
    const rewardAmountInOneBlock = divideDecimals(
      rewardPerBlock.toString(),
      this.getRewardToken().decimals,
    );

    // 하루 총 생성 블록 갯수
    const blocksInOneDay = div(ONE_DAY_SECONDS, this.context.blockTimeSecond);

    // 하루 총 리워드 갯수
    const rewardAmountInOneDay = mul(rewardAmountInOneBlock, blocksInOneDay);

    // 하루 총 리워드 USD 가격
    const rewardValueInOneDay = mul(
      rewardAmountInOneDay,
      this.getRewardToken().price_value,
    );

    // 일년 총 리워드 USD 가격
    const rewardValueInOneYear = mul(ONE_YEAR_DAYS, rewardValueInOneDay);

    return {
      totalAllocPoint,
      rewardValueInOneYear,
    };
  }

  async registerFarm(
    farmInfo: { pid: number; lpToken: string },
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

    if (isUndefined(stakeToken)) return false;

    await this.farmService.createFarm(
      {
        protocol: this.context.protocol,
        name: this.context.farmName,
        address: this.context.farmAddress,
        pid: farmInfo.pid,
        assets: getFarmAssetName([stakeToken], [this.getRewardToken()]),
        stake_tokens: [stakeToken],
        reward_tokens: [this.getRewardToken()],
        data: JSON.stringify({ lpToken: farmInfo.lpToken }),
      },
      manager,
    );
    return true;
  }

  async refreshFarm(
    farmInfo: { pid: number; allocPoint: BigNumberish; lpToken: string },
    farmState: {
      totalAllocPoint: BigNumberish;
      rewardValueInOneYear: BigNumber;
    },
    @TransactionManager() manager?: EntityManager,
  ): Promise<void> {
    const { id, stake_tokens, status } = await this.farmService.findFarm(
      {
        protocol: this.context.protocol,
        name: this.context.farmName,
        address: this.context.farmAddress,
        pid: farmInfo.pid,
        data: JSON.stringify({ lpToken: farmInfo.lpToken }),
      },
      manager,
    );

    if (!status) return;

    const targetStakeToken = stake_tokens[0];

    // 총 유동 수량
    const liquidityAmount = divideDecimals(
      await getSafeERC20BalanceOf(
        this.context.provider,
        this.context.multiCallAddress,
        targetStakeToken.address,
        this.context.farmAddress,
      ),
      targetStakeToken.decimals,
    );

    // 총 유동 가치(USD)
    const liquidityValue = mul(liquidityAmount, targetStakeToken.price_value);
    // 총 점유율
    const sharePointOfFarm = div(
      farmInfo.allocPoint,
      farmState.totalAllocPoint,
    );

    // 1년 할당 리워드 가치 (USD)
    const allocatedRewardValueInOneYear = mul(
      farmState.rewardValueInOneYear,
      sharePointOfFarm,
    );

    // apr
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

      const farmState = await this.getFarmState();

      for await (const pid of pids) {
        let queryRunner: QueryRunner | null = null;

        try {
          const farm = await this.farmService.findFarm({
            protocol: this.context.protocol,
            name: this.context.farmName,
            address: this.context.farmAddress,
            pid,
          });

          const farmInfo = farmInfos[pid];

          if (isNull(farmInfo)) continue;

          const { lpToken, allocPoint, exists } = farmInfo;

          if (isZero(allocPoint) || !exists) {
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
              { pid, lpToken },
              queryRunner.manager,
            );
          }
          if (initialized) {
            await this.refreshFarm(
              { pid, allocPoint, lpToken },
              farmState,
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
      logger.setData(loggerData);
    } catch (e) {
      this.errorHandler(e);
    }
  }
}
