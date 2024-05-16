import axios from 'axios';
import { Provider } from '@ethersproject/providers';
import { ethers, BigNumber } from 'ethers';
import * as crypto from 'crypto';

/**
 * block infos (with transaction)
 * @param provider node provider
 * @param blockNumbers search block numbers
 * @param withTransaction include transaction
 * @returns block infos
 */
export function getBatchBlockInfos(
  provider: Provider,
  blockNumbers: number[],
  withTransaction = true,
) {
  const data = blockNumbers.map((blockNumber: number) => {
    return {
      id: crypto.randomInt(0, 100000),
      jsonrpc: '2.0',
      method: 'eth_getBlockByNumber',
      params: [
        ethers.utils.hexStripZeros(BigNumber.from(blockNumber).toHexString()),
        withTransaction,
      ],
    };
  });

  const config = {
    ..._extractConnection(provider),
    method: 'post',
    data,
  };

  return axios(config);
}

function _extractConnection(provider: Provider) {
  const extractProviderInfo = JSON.parse(JSON.stringify(provider)).connection;
  return extractProviderInfo;
}
