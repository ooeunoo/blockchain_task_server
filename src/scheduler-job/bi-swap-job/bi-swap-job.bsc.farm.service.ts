import { BigNumberish } from '@ethersproject/bignumber';
import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import {
  EntityManager,
  getConnection,
  QueryRunner,
  TransactionManager,
} from 'typeorm';
import { fillSequenceNumber } from '../../../libs/helper/src/array';
import { getSafeERC20BalanceOf } from '../../../libs/helper/src/batch-contract';
import { div, isZero, mul } from '../../../libs/helper/src/bignumber';
import {
  ONE_DAY_SECONDS,
  ONE_YEAR_DAYS,
  ZERO,
} from '../../../libs/helper/src/constant';
import { divideDecimals } from '../../../libs/helper/src/decimals';
import { getFarmAssetName } from '../../../libs/helper/src/naming';
import { isNull, isUndefined } from '../../../libs/helper/src/type';
import { Token } from '../../../libs/repository/src/token/entity';
import { SchedulerLoggerDTO } from '../../app-scheduler/scheduler-logger/scheduler-logger.dto';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { BiSwapBSCService } from '../../defi/bi-swap/bi-swap.bsc.service';
import { FarmService } from '../../farm/farm.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { TokenService } from '../../token/token.service';
import { ID } from '../scheduler-job.constant';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { FarmTemplate } from '../template/farm.template';

@Injectable()
export class BiSwapJobBSCFarmService extends FarmTemplate {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly farmService: FarmService,
    public readonly context: BiSwapBSCService,
  ) {
    super(
      ID.BI_SWAP.BSC.FARM,
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

  getRewardToken(): Token {
    return this.context.token;
  }

  async registerFarm(
    farmInfo: { pid: number; lpToken: string; data?: any },
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
        data: farmInfo.data ? JSON.parse(farmInfo.data) : null,
      },
      manager,
    );
    return true;
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

  async refreshFarm(
    farmInfo: { pid: number; allocPoint: BigNumberish },
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

          const { lpToken, allocPoint } = farmInfo;

          // Alloc Point 0 => 비활성화
          if (isZero(allocPoint)) {
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

          // 풀 추가 등록
          let initialized = true;
          if (isUndefined(farm)) {
            initialized = await this.registerFarm(
              { pid, lpToken },
              queryRunner.manager,
            );
          }

          if (initialized) {
            await this.refreshFarm(
              { pid, allocPoint },
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
    } catch (e) {
      this.errorHandler(e);
    } finally {
      if (logger) {
        logger.setData(loggerData);
      }
    }
  }
}
