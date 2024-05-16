import * as _ from 'lodash';
import { ethers } from 'ethers';
import { getCreate2Address } from '@ethersproject/address';
import { keccak256, pack } from '@ethersproject/solidity';

/**
 * 체크섬 어드레스
 * @param address address
 * @returns checkSum address
 */
export function toCheckSumAddress(address: string): string {
  return ethers.utils.getAddress(address);
}

/**
 * 주소 유효성
 * @param address address
 * @returns boolean
 */
export function isAddress(address: string): boolean {
  try {
    toCheckSumAddress(address);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 제로 주소
 * @param address address
 * @returns boolean
 */
export function isZeroAddress(address: string): boolean {
  return address === ethers.constants.AddressZero;
}

/**
 * pair 주소 계산
 * @param factoryAddress pair 공장
 * @param factoryInitHash pair 공장 초기 해시
 * @param token0Address  token0 주소
 * @param token1Address  token1 주소
 * @returns pair 주소
 */
export function computePairAddress(
  factoryAddress: string,
  factoryInitHash: string,
  token0Address: string,
  token1Address: string,
) {
  // this uniswap sdk: Token.sortsBefore
  const [token0, token1] =
    token0Address.toLowerCase() < token1Address.toLowerCase()
      ? [token0Address, token1Address]
      : [token1Address, token0Address];

  return getCreate2Address(
    factoryAddress,
    keccak256(['bytes'], [pack(['address', 'address'], [token0, token1])]),
    factoryInitHash,
  );
}
