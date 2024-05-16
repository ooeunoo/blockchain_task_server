import { Body, Controller, Delete, HttpStatus, Post } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { getSafeCheckCA } from '@libs/helper/batch-contract';
import { isUndefined } from '@libs/helper/type';
import { ExceptionCode } from '../common/exceptions/exception.constant';
import { Exception } from '../common/exceptions/exception.service';
import { NetworkService } from '../network/network.service';
import { API_PATH } from './interaction.constant';
import { InteractionBody } from './interaction.dto';
import { InteractionService } from './interaction.service';

@ApiTags(API_PATH.ROOT)
@Controller(API_PATH.ROOT)
export class InteractionController {
  constructor(
    private readonly interactionService: InteractionService,
    private readonly networkService: NetworkService,
  ) {}

  /**
   * interaction 추가
   * @param body  InteractionBody
   * @returns { success: true }
   */
  @ApiResponse({
    status: 200,
    description: 'add interaction',
    // type: FarmSearchItem,
  })
  @Post()
  async addInteraction(@Body() body: InteractionBody): Promise<any> {
    const { chainId, address, interactedAddress } = body;

    const network = await this.networkService.findNetwork({
      chain_id: chainId,
    });

    if (isUndefined(network)) {
      throw new Exception(ExceptionCode.ERR100, {
        httpCode: HttpStatus.BAD_REQUEST,
      });
    }

    const provider = this.networkService.provider(Number(chainId));
    const multiCallAddress = this.networkService.multiCallAddress(
      Number(chainId),
    );

    const checkCA = getSafeCheckCA(
      provider,
      multiCallAddress,
      interactedAddress,
    );

    if (!checkCA) {
      throw new Exception(ExceptionCode.ERR700, {
        httpCode: HttpStatus.BAD_REQUEST,
      });
    }

    const params = {
      network,
      from_address: address,
      to_address: interactedAddress,
    };

    await this.interactionService.createInteractionsIfNotExist([params]);
    return { success: true };
  }

  /**
   * interaction 삭제
   * @param body  interactionBody
   * @returns { success: true }
   */
  @ApiResponse({
    status: 200,
    description: 'delete interaction',
  })
  @Delete()
  async delInteraction(@Body() body: InteractionBody): Promise<any> {
    const { chainId, address, interactedAddress } = body;

    const network = await this.networkService.findNetwork({
      chain_id: chainId,
    });

    if (isUndefined(network)) {
      throw new Exception(ExceptionCode.ERR100, {
        httpCode: HttpStatus.BAD_REQUEST,
      });
    }

    const params = {
      network,
      from_address: address,
      to_address: interactedAddress,
    };

    const existInteraction = await this.interactionService.findInteraction(
      params,
    );

    if (isUndefined(existInteraction)) {
      throw new Exception(ExceptionCode.ERR701, {
        httpCode: HttpStatus.BAD_REQUEST,
      });
    }

    await this.interactionService.deleteInteraction(params);
    return { success: true };
  }
}
