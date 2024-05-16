import { Constructor } from '@libs/helper/constructor';
import { IDeFiLending } from './defi.interface';

export function DeFiLending<T extends Constructor>(C: T) {
  abstract class Base extends C implements IDeFiLending {
    constructor(...args: any[]) {
      super(...args);
    }

    /**
     * 지갑의 lending 대출 관련 정보
     * @param walletAddress 지갑 주소
     */
    abstract getWalletLendings(walletAddress: string): Promise<any>;
  }
  return Base;
}
