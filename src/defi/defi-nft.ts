import { BigNumber, Contract } from 'ethers';
import { Constructor } from '@libs/helper/constructor';
import { IDeFiNFT } from './defi.interface';

export function DeFiNFT<T extends Constructor>(C: T) {
  abstract class Base extends C implements IDeFiNFT {
    constructor(...args: any[]) {
      super(...args);
    }

    abstract get nfTokenAddress(): string;
    abstract get nfTokenAbi(): any[];
    abstract get nfTokenContract(): Contract;

    /**
     * 유저의 NFT 정보 조회
     * @param walletAddress 유저 주소
     * @param params nf token search query params
     */
    abstract getWalletNFTokens(
      walletAddress: string,
      params?: any,
    ): Promise<any>;

    /**
     * NF 토큰 총 발행량
     */
    abstract getNFTokenTotalSupply(): Promise<BigNumber>;

    /**
     * NF 토큰 정보 조회
     * @param pids pid에 등록된 NFT 토큰 정보
     */
    abstract getNFTokenInfos(pids: number[]): Promise<
      {
        id: BigNumber;
        owner: string;
        tokenURI: string;
      }[]
    >;
  }
  return Base;
}
