import { Injectable } from '@nestjs/common';
import {
  add,
  div,
  isGreaterThan,
  isZero,
  mul,
  sub,
} from '@libs/helper/bignumber';
import { ONE_YEAR_SECONDS, ZERO } from '@libs/helper/constant';
import { divideDecimals } from '@libs/helper/decimals';
import { MdexBSCService } from '../../defi/mdex/mdex.bsc.service';
import { FarmService } from '../../farm/farm.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { TokenService } from '../../token/token.service';
import { ID } from '../scheduler-job.constant';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { FarmTemplate } from '../template/farm.template';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { SchedulerLoggerDTO } from '../../app-scheduler/scheduler-logger/scheduler-logger.dto';
import { BigNumberish } from '@ethersproject/bignumber';
import { fillSequenceNumber } from '../../../libs/helper/src/array';
import {
  EntityManager,
  getConnection,
  QueryRunner,
  TransactionManager,
} from 'typeorm';
import { isNull, isUndefined } from '../../../libs/helper/src/type';
import BigNumber from 'bignumber.js';
import { Token } from '../../../libs/repository/src/token/entity';
import { getFarmAssetName } from '../../../libs/helper/src/naming';

@Injectable()
export class MdexJobBSCFarmService extends FarmTemplate {
  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly tokenService: TokenService,
    public readonly farmService: FarmService,
    public readonly context: MdexBSCService,
  ) {
    super(
      ID.MDEX.BSC.FARM,
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

  async getFarmState() {
    const [currentBlockNumber, totalAllocPoint, halvingPeriod, startBlock] =
      await Promise.all([
        this.context.getBlockNumber(),
        this.context.getFarmTotalAllocPoint(),
        this.context.getFarmHalvingPeriod(),
        this.context.getFarmStartBlock(),
      ]);
    let rewardAmountInOneYear = ZERO;

    let l: any = currentBlockNumber;
    const afterOneYearBlockNumber = add(
      currentBlockNumber,
      div(ONE_YEAR_SECONDS, this.context.blockTimeSecond),
    );
    // eslint-disable-next-line prefer-const
    let [n, m] = await Promise.all([
      this.context.getFarmPhase(currentBlockNumber),
      this.context.getFarmPhase(afterOneYearBlockNumber.toString()),
    ]);

    while (isGreaterThan(m, n)) {
      n = add(n, 1);
      const r = add(mul(n, halvingPeriod), startBlock);
      rewardAmountInOneYear = add(
        rewardAmountInOneYear,
        mul(sub(r, l), await this.context.getFarmReward(r.toString())),
      );
      l = r;

      rewardAmountInOneYear = add(
        rewardAmountInOneYear,
        mul(
          sub(afterOneYearBlockNumber, l),
          await this.context.getFarmReward(afterOneYearBlockNumber.toString()),
        ),
      );
    }

    // 일년 총 리워드 갯수
    const totalRewardAmountInOneYear = divideDecimals(
      rewardAmountInOneYear,
      this.getRewardToken().decimals,
    );
    // 일년 총 리워드 USD 가격
    const rewardValueInOneYear = mul(
      totalRewardAmountInOneYear,
      this.getRewardToken().price_value,
    );

    return {
      totalAllocPoint,
      rewardValueInOneYear,
    };
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

    // 스테이킹 토큰이 미등록 or 비활성화 일 경우, 팜 등록 제외
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

  async refreshFarm(
    farmInfo: {
      pid: number;
      allocPoint: BigNumberish;
      totalAmount: BigNumberish;
    },
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
      farmInfo.totalAmount,
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

          const { lpToken, allocPoint, totalAmount } = farmInfo;

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
              { pid, allocPoint, totalAmount },
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
