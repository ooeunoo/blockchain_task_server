import { BigNumber, Contract, BigNumberish } from 'ethers';
import { Constructor } from '@libs/helper/constructor';
import { IDeFiFarm } from './defi.interface';
import { Farm } from '@libs/repository/farm/entity';
import { Token } from '../../libs/repository/src/token/entity';

export function DeFiFarm<T extends Constructor>(C: T) {
  abstract class Base extends C implements IDeFiFarm {
    constructor(...args: any[]) {
      super(...args);
    }

    abstract get farmName(): string;
    abstract get farmAddress(): string;
    abstract get farmAbi(): any[];
    abstract get farmContract(): Contract;

    /**
     * 지갑의 Farm 관련 정보 조회
     * process <모든 Farm을 조회하기에는 비용이 너무 큼>
     *  1. 프로토콜 관련 Farm 주소 리스트 조회
     *  2. 지갑의 주소와 상호 작용한 Farm 주소 리스트 조회
     *  3. 상호작용한 Farm 주소를 통해 지갑의 Farm 관련 정보 조회
     *
     * @param farms  Farm
     * @param walletAddress 지갑 주소
     */
    abstract getWalletFarms(farms: Farm[], walletAddress: string): Promise<any>;

    /**
     * Farm에 대한 지갑 정보 조회
     * @param farms 조회할 Farm entity
     * @param walletAddress 지갑 주소
     */
    abstract getFarmWalletInfo(
      farms: Farm[],
      walletAddress: string,
    ): Promise<any>;

    /**
     * 총 Farm 갯수
     * @returns Farm total length
     */
    abstract getFarmTotalLength(): Promise<BigNumber>;

    /**
     * 총 Farm 할당 포인트
     * @returns Farm total alloc point
     */
    abstract getFarmTotalAllocPoint(): Promise<BigNumber>;

    /**
     * Farm의 블록 당 리워드 수
     * @returns Farm reward per block
     */
    abstract getFarmRewardPerBlock(): Promise<BigNumberish>;

    /**
     * pid에 등록된 Farm 정보 조회
     * @param pids farm's pid
     * @returns any
     */
    abstract getFarmInfos(pids: number[]): Promise<any>;

    /**
     * reward index 정렬
     * @param tokens rewardTokens
     * @param sortByAddress sorting by address
     * @returns tokens
     */
    sortByRewardTokens(tokens: Token[], sortByAddress: string[]) {
      return sortByAddress.map((sort) =>
        tokens.filter(({ address }) => address === sort),
      );
    }
  }
  return Base;
}
