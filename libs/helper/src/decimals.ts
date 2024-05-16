import BigNumber from 'bignumber.js';

/**
 *
 * @param value base value
 * @param decimals adjust decimals
 * @returns
 */
export function multiplyDecimals(value: any, decimals: number) {
  value = new BigNumber(value.toString());

  if (value.isZero()) {
    return value;
  }

  return value.shiftedBy(decimals);
}

/**
 *
 * @param value base value
 * @param decimals adjust decimals
 * @returns
 */
export function divideDecimals(value: any, decimals: number) {
  value = new BigNumber(value.toString());

  if (value.isZero()) {
    return value;
  }

  return value.shiftedBy(decimals * -1);
}
