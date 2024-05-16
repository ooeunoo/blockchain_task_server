import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import {
  decodeFunctionResultData,
  encodeFunction,
} from '@libs/helper/encodeDecode';
import { DeFiAMM } from '../defi-amm';
import { DeFiBase } from '../defi-base';
import { CHAIN_ID, PROTOCOL } from '@libs/helper/blockchain';
import { getBatchStaticAggregator } from '@libs/helper/batch-contract';
import { isNullBytes } from '@libs/helper/type';
import { AbiService } from '../../abi/abi.service';
import { InteractionService } from '../../interaction/interaction.service';
import { NetworkService } from '../../network/network.service';
import { ProtocolService } from '../../protocol/protocol.service';
import { TokenService } from '../../token/token.service';
import { INFO } from './sushi-swap.constant';

@Injectable()
export class SushiSwapHECOService extends DeFiAMM(DeFiBase) {
  name = PROTOCOL.SUSHI_SWAP;
  chainId = CHAIN_ID.HECO;
  constants = INFO[CHAIN_ID.HECO];

  constructor(
    public readonly networkService: NetworkService,
    public readonly protocolService: ProtocolService,
    public readonly tokenService: TokenService,
    public readonly abiService: AbiService,
    public readonly interactionService: InteractionService,
  ) {
    super(
      networkService,
      protocolService,
      tokenService,
      abiService,
      interactionService,
    );
  }

  getWalletAMMs(walletAddress: string): Promise<any> {
    throw new Error('Method not implemented.');
  }

  get ammFactoryAddress(): string {
    return this.constants.amm.factory_address;
  }

  get ammFactoryInitCodeHash(): string {
    return this.constants.amm.factory_init_code_hash;
  }

  get ammFactoryAbi(): any[] {
    return this.addressABI.get(this.ammFactoryAddress);
  }

  get ammFactoryContract(): Contract {
    const res = new ethers.Contract(
      this.ammFactoryAddress,
      this.ammFactoryAbi,
      this.provider,
    );
    return res;
  }

  async getAMMFactoryTotalLength(): Promise<BigNumber> {
    return this.ammFactoryContract.allPairsLength();
  }

  async getAMMFactoryInfos(pids: number[]): Promise<string[]> {
    const ammFactoryInfoEncode = pids.map((pid: number) => [
      this.ammFactoryAddress,
      encodeFunction(this.ammFactoryAbi, 'allPairs', [pid]),
    ]);

    const ammFactoryInfoBatchCall = await getBatchStaticAggregator(
      this.provider,
      this.multiCallAddress,
      ammFactoryInfoEncode,
    );

    return ammFactoryInfoBatchCall.map(({ success, returnData }) => {
      return success && !isNullBytes(returnData)
        ? decodeFunctionResultData(
            this.ammFactoryAbi,
            'allPairs',
            returnData,
          )[0]
        : [];
    });
  }
}
