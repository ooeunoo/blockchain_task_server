import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { API_PATH } from '../swap/swap.constant';
import { TokenService } from '../token/token.service';
import { SwapSearchQuery } from './swap.dto';
import { SwapService } from './swap.service';
import { isNull, isUndefined } from '@libs/helper/type';
import { Exception } from '../common/exceptions/exception.service';
import { ExceptionCode } from '../common/exceptions/exception.constant';

@ApiTags(API_PATH.ROOT)
@Controller(API_PATH.ROOT)
export class SwapController {
  constructor(
    private readonly swapService: SwapService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * token swap rate list
   * @param query swap search query
   * @returns listing swap rate each protocol
   */
  @ApiResponse({
    description: 'token swap rate info each protocol',
    status: 200,
  })
  @Get(API_PATH.SEARCH)
  async getTokenSwapList(@Query() query: SwapSearchQuery): Promise<any> {
    const { inputTokenId, outputTokenId, inputTokenAmount } = query;

    const [inputSearch, outputSearch] = await Promise.all([
      this.tokenService.search({
        id: inputTokenId,
      }),
      this.tokenService.search({
        id: outputTokenId,
      }),
    ]);

    const inputToken = inputSearch[0];
    const outputToken = outputSearch[0];

    if (isUndefined(inputToken)) {
      throw new Exception(ExceptionCode.ERR900, {
        httpCode: HttpStatus.BAD_REQUEST,
      });
    }

    if (isUndefined(outputToken)) {
      throw new Exception(ExceptionCode.ERR901, {
        httpCode: HttpStatus.BAD_REQUEST,
      });
    }

    const inputTokenChainId = inputToken.network.chain_id;
    const outputTokenChainID = outputToken.network.chain_id;

    if (inputTokenChainId !== outputTokenChainID) {
      throw new Exception(ExceptionCode.ERR902, {
        httpCode: HttpStatus.BAD_REQUEST,
      });
    }

    const chainId = inputTokenChainId || outputTokenChainID;

    if (
      isUndefined(this.swapService.protocolWithService.get(Number(chainId)))
    ) {
      throw new Exception(ExceptionCode.ERR200, {
        httpCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }

    let result;
    try {
      result = await this.swapService.search(
        chainId,
        isNull(inputToken.wrapped) ? inputToken : inputToken.wrapped,
        isNull(outputToken.wrapped) ? outputToken : outputToken.wrapped,
        inputTokenAmount,
      );
    } catch (e) {
      console.log(e);
    }

    return { itemCount: result.length, item: result };
  }
}
