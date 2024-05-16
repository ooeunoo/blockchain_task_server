import * as _ from 'lodash';
import { ethers } from 'ethers';
import { arrayify } from '@ethersproject/bytes';
import { CronTime } from 'cron';

/**
 * is null
 * @param value value
 * @returns  boolean
 */
export function isNull(value: any): boolean {
  try {
    return _.isNull(value);
  } catch (e) {
    return false;
  }
}

/**
 * is undefined
 * @param value value
 * @returns  boolean
 */
export function isUndefined(value: any): boolean {
  try {
    return _.isUndefined(value);
  } catch (e) {
    return false;
  }
}

/**
 * is number
 * @param value value
 * @returns boolean
 */
export function isNumber(value: any): boolean {
  try {
    return _.isNumber(value);
  } catch (e) {
    return false;
  }
}

/**
 * is bytes32
 * @param value value
 * @returns boolean
 */
export function isBytes32(value: any): boolean {
  try {
    // const data = arrayify(value);
    // if (data.length !== 32 || data[31] !== 0) throw new Error();
    return ethers.utils.isBytesLike(value);
  } catch (e) {
    return false;
  }
}

/**
 * is null bytes (0x)
 * @param value value
 * @returns boolean
 */
export function isNullBytes(value: string): boolean {
  return value === '0x';
}

/**
 * is NAN
 * @param value value
 * @returns boolean
 */
export function isNaN(value: any): boolean {
  try {
    return _.isNaN(value);
  } catch (e) {
    return false;
  }
}

/**
 * is json
 * @param value value
 * @returns boolean
 */
export function isJSON(value: any): boolean {
  try {
    JSON.parse(JSON.stringify(value));
  } catch (e) {
    return false;
  }
  return true;
}

/**
 * is string
 * @param value value
 * @returns boolean
 */
export function isString(value: any): boolean {
  try {
    return _.isString(value);
  } catch (e) {
    return false;
  }
}

/**
 * is object
 * @param value value
 * @returns boolean
 */
export function isObject(value: any): boolean {
  try {
    return _.isObject(value);
  } catch (e) {
    return false;
  }
}

/**
 * is array
 * @param value value
 * @returns boolean
 */
export function isArray(value: any): boolean {
  try {
    return _.isArray(value);
  } catch (e) {
    return false;
  }
}

/**
 * is cron stirng
 * @param value value
 * @returns boolean
 */
export function isCronString(value: any): boolean {
  try {
    new CronTime(value);
    return true;
  } catch (e) {
    return false;
  }
}
