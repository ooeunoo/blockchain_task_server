import { Injectable } from '@nestjs/common';
import { NFTTemplate } from '../template/nft.template';
import { AirNftBSCService } from '../../defi/air-nft/air-nft.bsc.service';
import { SchedulerService } from '../../scheduler/scheduler.service';
import { ID } from '../scheduler-job.constant';
import { NFTokenService } from '../../nf-token/nf-token.service';
import { SingletonSchedulerRegistry } from '../scheduler-job.registry';
import { SchedulerLoggerService } from '../../app-scheduler/scheduler-logger/scheduler-logger.service';
import { checkURI } from '../../../libs/helper/src/regExp';
import axios from 'axios';
import { get } from '../../../libs/helper/src/object';
import { BigNumber } from '@ethersproject/bignumber';

@Injectable()
export class AirNFTBSCNFTService extends NFTTemplate {
  imageOrAnimationPath = 'nft.image';

  constructor(
    public readonly singletonSchedulerRegistry: SingletonSchedulerRegistry,
    public readonly schedulerService: SchedulerService,
    public readonly schedulerLoggerService: SchedulerLoggerService,
    public readonly nfTokenService: NFTokenService,
    public readonly context: AirNftBSCService,
  ) {
    super(
      ID.AIR_NFT.BSC.NFT,
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

        const isValidURI = checkURI(tokenURI);
        try {
          const data = isValidURI ? (await axios.get(tokenURI)).data : null;
          imageOrAnimationUri = get(data, this.imageOrAnimationPath);
        } catch (e) {
          imageOrAnimationUri = null;
        }

        return {
          protocol: this.context.protocol,
          address: this.context.nfTokenAddress,
          index: id.toString(),
          token_uri: tokenURI,
          image_or_animation_uri: imageOrAnimationUri,
        };
      }),
    );

    return crawledNFTokens;
  }
}
