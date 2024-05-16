import { ethers } from 'ethers';
import BigNumber from 'bignumber.js';

export const ZERO_ADDRESS = ethers.constants.AddressZero;
export const ZERO_HASH = ethers.constants.HashZero;
export const NULL_BYTE = '0x';

export const ZERO = new BigNumber(0);
export const ONE_YEAR_DAYS = new BigNumber(365);
export const ONE_DAY_SECONDS = new BigNumber(86400);
export const ONE_YEAR_SECONDS = new BigNumber(365).multipliedBy(
  new BigNumber(86400),
);

export const UNKNOWN_STRING = 'UNKNOWN';
export const UNKNOWN_UINT256 = 0;
