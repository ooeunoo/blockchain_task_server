import * as crypto from 'crypto';

/**
 * random
 * @param a start number
 * @param b end number
 * @returns random number
 */
export function random(a = 0, b = 10000000) {
  return crypto.randomInt(a, b);
}
