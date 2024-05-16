import { Injectable } from '@nestjs/common';
import { BigNumber, Contract, ethers } from 'ethers';
import { CHAIN_ID, PROTOCOL } from '@libs/helper/blockchain';
import { DeFiBase } from '../defi-base';
import { DeFiLending } from '../defi-lending';
import { Lending } from '@libs/repository/lending/entity';
import { div, isZero, mul, toFixed } from '@libs/helper/bignumber';
import {
  decodeFunctionResultData,
  encodeFunction,
} from '@libs/helper/encodeDecode';
import { getBatchStaticAggregator } from '@libs/helper/batch-contract';
import { isNullBytes, isUndefined } from '@libs/helper/type';
import { flat, toSplitWithChunkSize, zip } from '@libs/helper/array';
import { ZERO, ZERO_ADDRESS } from '@libs/helper/constant';
import { divideDecimals } from '@libs/helper/decimals';
import { NetworkService } from '../../network/network.service';
import { ProtocolService } from '../../protocol/protocol.service';
import { TokenService } from '../../token/token.service';
import { AbiService } from '../../abi/abi.service';
import { InteractionService } from '../../interaction/interaction.service';
import { LendingService } from '../../lending/lending.service';
import { INFO } from './venus.constant';

@Injectable()
export class VenusBSCService extends DeFiLending(DeFiBase) {
  name = PROTOCOL.VENUS;
  chainId = CHAIN_ID.BSC;
  constants = INFO[CHAIN_ID.BSC];

  constructor(
    public readonly networkService: NetworkService,
    public readonly protocolService: ProtocolService,
    public readonly tokenService: TokenService,
    public readonly abiService: AbiService,
    public readonly interactionService: InteractionService,
    private readonly lendingService: LendingService,
  ) {
    super(
      networkService,
      protocolService,
      tokenService,
      abiService,
      interactionService,
    );
  }

  async getWalletLendings(walletAddress: string, params?: any): Promise<any> {
    const userAssets = await this.getWalletLendingMarket(walletAddress);

    const items = await this.lendingService.search({
      ...params,
      protocolId: this.protocol.id,
      addresses: userAssets,
    });

    if (isUndefined(items)) return [];

    const farmLendingInfo = await this.getLendingWalletInfo(
      items,
      walletAddress,
    );
    return farmLendingInfo;
  }

  get lendingAddress(): string {
    return this.constants.lending.address;
  }

  get lendingAbi(): any[] {
    return this.addressABI.get(this.lendingAddress);
  }

  get lendingContract(): Contract {
    return new ethers.Contract(
      this.lendingAddress,
      this.lendingAbi,
      this.provider,
    );
  }

  get vTokenAddress(): string {
    return this.constants.v_token_sample_address.address;
  }

  get vTokenAbi(): any[] {
    return this.addressABI.get(this.vTokenAddress);
  }

  vTokenContract(address: string): Contract {
    return new ethers.Contract(address, this.vTokenAbi, this.provider);
  }

  async getLendingAllMarkets(): Promise<string[]> {
    return this.lendingContract.getAllMarkets();
  }

  async getWalletLendingMarket(walletAddress: string): Promise<string[]> {
    return this.lendingContract.getAssetsIn(walletAddress);
  }

  async getLendingMarketInfos(market: string): Promise<{
    underlying: string;
    supplyRatePerBlock: BigNumber;
    borrowRatePerBlock: BigNumber;
    decimals: number;
    totalBorrows: BigNumber;
    totalReserves: BigNumber;
    reserveFactorMantissa: BigNumber;
    market: {
      isListed: boolean;
      collateralFactorMantissa: BigNumber;
      isVenus: boolean;
    };
  }> {
    const marketInfoEncode = [
      [market, encodeFunction(this.vTokenAbi, 'underlying')],
      [market, encodeFunction(this.vTokenAbi, 'supplyRatePerBlock')],
      [market, encodeFunction(this.vTokenAbi, 'borrowRatePerBlock')],
      [market, encodeFunction(this.vTokenAbi, 'decimals')],
      [market, encodeFunction(this.vTokenAbi, 'totalBorrows')],
      [market, encodeFunction(this.vTokenAbi, 'totalReserves')],
      [market, encodeFunction(this.vTokenAbi, 'reserveFactorMantissa')],
      [
        this.lendingAddress,
        encodeFunction(this.lendingAbi, 'markets', [market]),
      ],
    ];

    const marketInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      marketInfoEncode,
    );

    const [
      { success: underlyingSuccess, returnData: underlyingData },
      {
        success: supplyRatePerBlockSuccess,
        returnData: supplyRatePerBlockData,
      },
      {
        success: borrowRatePerBlockSuccess,
        returnData: borrowRatePerBlockData,
      },
      { success: decimalSuccess, returnData: decimalData },
      { success: totalBorrowSuccess, returnData: totalBorrowData },
      { success: totalReserveSuccess, returnData: totalReserveData },
      { success: reserveFactorSuccess, returnData: reserveFactorData },
      { success: marketSuccess, returnData: marketData },
    ] = marketInfoBatchCall;

    return {
      underlying:
        underlyingSuccess && !isNullBytes(underlyingData)
          ? decodeFunctionResultData(
              this.vTokenAbi,
              'underlying',
              underlyingData,
            )[0]
          : ZERO_ADDRESS,
      supplyRatePerBlock:
        supplyRatePerBlockSuccess && !isNullBytes(supplyRatePerBlockData)
          ? decodeFunctionResultData(
              this.vTokenAbi,
              'supplyRatePerBlock',
              supplyRatePerBlockData,
            )[0]
          : ZERO,
      borrowRatePerBlock:
        borrowRatePerBlockSuccess && !isNullBytes(borrowRatePerBlockData)
          ? decodeFunctionResultData(
              this.vTokenAbi,
              'borrowRatePerBlock',
              borrowRatePerBlockData,
            )[0]
          : ZERO,
      decimals:
        decimalSuccess && !isNullBytes(decimalData)
          ? decodeFunctionResultData(this.vTokenAbi, 'decimals', decimalData)[0]
          : ZERO,
      totalBorrows:
        totalBorrowSuccess && !isNullBytes(totalBorrowData)
          ? decodeFunctionResultData(
              this.vTokenAbi,
              'totalBorrows',
              totalBorrowData,
            )[0]
          : ZERO,
      totalReserves:
        totalReserveSuccess && !isNullBytes(totalReserveData)
          ? decodeFunctionResultData(
              this.vTokenAbi,
              'totalReserves',
              totalReserveData,
            )[0]
          : ZERO,
      reserveFactorMantissa:
        reserveFactorSuccess && !isNullBytes(reserveFactorData)
          ? decodeFunctionResultData(
              this.vTokenAbi,
              'reserveFactorMantissa',
              reserveFactorData,
            )[0]
          : ZERO,
      market:
        marketSuccess && !isNullBytes(marketData)
          ? decodeFunctionResultData(this.lendingAbi, 'markets', marketData)
          : null,
    };
  }

  private async getLendingWalletInfo(
    markets: Lending[],
    walletAddress: string,
  ) {
    const walletInfoEncode = markets.map(({ address }) => {
      return [
        [address, encodeFunction(this.vTokenAbi, 'balanceOf', [walletAddress])],
        [address, encodeFunction(this.vTokenAbi, 'exchangeRateStored')],
        [
          address,
          encodeFunction(this.vTokenAbi, 'borrowBalanceStored', [
            walletAddress,
          ]),
        ],
      ];
    });

    const walletInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      flat(walletInfoEncode),
    );

    const walletInfoBatchCallMap = toSplitWithChunkSize(walletInfoBatchCall, 3);

    const walletInfoBatchCallMapZip = zip(markets, walletInfoBatchCallMap);

    const output = [];
    walletInfoBatchCallMapZip.forEach(([market, result]) => {
      const {
        token: { decimals },
      } = market;

      const [
        { success: balanceOfSuccess, returnData: balanceOfData },
        { success: exchangeRateSuccess, returnData: exchangeRateData },
        { success: borrowBalanceSuccess, returnData: borrowBalanceData },
      ] = result;

      const balanceOf =
        balanceOfSuccess && !isNullBytes(balanceOfData)
          ? decodeFunctionResultData(
              this.vTokenAbi,
              'balanceOf',
              balanceOfData,
            )[0]
          : ZERO;

      const exchangeRate =
        exchangeRateSuccess && !isNullBytes(exchangeRateData)
          ? decodeFunctionResultData(
              this.vTokenAbi,
              'exchangeRateStored',
              exchangeRateData,
            )[0]
          : ZERO;

      const borrowBalance =
        borrowBalanceSuccess && !isNullBytes(exchangeRateData)
          ? decodeFunctionResultData(
              this.vTokenAbi,
              'borrowBalanceStored',
              borrowBalanceData,
            )[0]
          : ZERO;

      const supplyAmount = divideDecimals(
        toFixed(div(mul(balanceOf, exchangeRate), 1e18), 0),
        decimals,
      );

      const borrowAmount = divideDecimals(borrowBalance, decimals);

      if (isZero(supplyAmount) && isZero(borrowAmount)) {
        return;
      }

      market.wallet = {
        supply_amount: supplyAmount.toString(),
        borrow_amount: borrowAmount.toString(),
      };

      output.push(market);
    });
    return output;
  }
}
