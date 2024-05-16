import { Injectable } from '@nestjs/common';
import { NFTTemplate } from '../template/nft.template';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { ID } from '../scheduler-job.constant';
import { NFTokenService } from '../../nf-token/nf-token.service';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { PancakeSwapBSCService } from '../../defi/pancake-swap/pancake-swap.bsc.service';
import axios from 'axios';
import { get } from '../../../libs/helper/src/object';
import { config } from '../../common/config/config.service';
import { BigNumber } from '@ethersproject/bignumber';

@Injectable()
export class PancakeSwapBSCNFTService extends NFTTemplate {
  imageOrAnimationPath = 'image';

  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly nfTokenService: NFTokenService,
    public readonly context: PancakeSwapBSCService,
  ) {
    super(
      ID.PANCAKE_SWAP.BSC.NFT,
      singletonSchedulerRegistry,
      schedulerService,
      schedulerLoggerService,
      nfTokenService,
      context,
    );
  }

  onModuleInit(): Promise<void> {
    return;
  }

  async networkPid(): Promise<BigNumber> {
    return this.context.getNFTokenTotalSupply();
  }

  async crawlNFTokens(pids: number[]): Promise<any> {
    const nfTokenInfos = await this.context.getNFTokenInfos(pids);

    const crawledNFTokens = await Promise.all(
      nfTokenInfos.map(async ({ id, tokenURI }) => {
        let imageOrAnimationUri = null;

        if (tokenURI.startsWith('ipfs://')) {
          const ipfsHost = config.ipfsHost;
          const ipfsHash = tokenURI.replace('ipfs://', '');
          const httpTokenUri = `${ipfsHost}/ipfs/${ipfsHash}`;

          try {
            const tokenData = (await axios.get(httpTokenUri)).data;

            const imageDataHash = get(
              tokenData,
              this.imageOrAnimationPath,
            ).replace('ipfs://', '');
            imageOrAnimationUri = `${ipfsHost}/ipfs/${imageDataHash}`;
          } catch (e) {
            imageOrAnimationUri = null;
          }

          return {
            protocol: this.context.protocol,
            address: this.context.nfTokenAddress,
            index: id.toString(),
            token_uri: httpTokenUri,
            image_or_animation_uri: imageOrAnimationUri,
          };
        }
      }),
    );

    return crawledNFTokens;
  }
}
