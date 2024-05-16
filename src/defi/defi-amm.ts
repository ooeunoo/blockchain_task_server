import { BigNumber, Contract } from 'ethers';
import { Constructor } from '@libs/helper/constructor';
import { IDeFiAMM } from './defi.interface';

export function DeFiAMM<T extends Constructor>(C: T) {
  abstract class Base extends C implements IDeFiAMM {
    constructor(...args: any[]) {
      super(...args);
    }

    abstract get ammFactoryAddress(): string;
    abstract get ammFactoryInitCodeHash(): string;
    abstract get ammFactoryAbi(): any[];
    abstract get ammFactoryContract(): Contract;

    // /**
    //  * 유저의  AMM 정보 조회
    //  * @param walletAddress wallet address
    //  */
    abstract getWalletAMMs(walletAddress: string): Promise<any>;

    /**
     * 총 AMM Factory에 등록된 pair 갯수
     * @returns Total amm length
     */
    abstract getAMMFactoryTotalLength(): Promise<BigNumber>;

    /**
     * pid에 등록된 Pair 정보 조회 (node Call => 1 회)
     * @param pids pair's pid
     * @returns
     */
    abstract getAMMFactoryInfos(pids: number[]): Promise<string[]>;
  }
  return Base;
}
