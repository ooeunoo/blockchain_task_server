import { ethers } from 'ethers';
import { isNullBytes } from './type';

/**
 * encode function call data
 * @param abi abi
 * @param targetFunction function name
 * @param params function argument
 * @returns encode data
 */
export function encodeFunction(
  abi: any,
  targetFunction: string,
  params?: any[],
) {
  const iface: any = _generateIface(abi);
  return iface.encodeFunctionData(targetFunction, params);
}

/**
 * decode function data
 * @param abi abi
 * @param targetFunction function name
 * @param data encoded data
 * @returns decoded data
 */
export function decodeFunction(abi: any, targetFunction: string, data: string) {
  const iface: any = _generateIface(abi);
  return iface.decodeFunctionData(targetFunction, data);
}

/**
 * decode function call result data
 * @param abi abi
 * @param targetFunction function name
 * @param data  encoded data
 * @returns decoded data
 */
export function decodeFunctionResultData(
  abi: any,
  targetFunction: string,
  data: string,
) {
  const iface: any = _generateIface(abi);
  return iface.decodeFunctionResult(targetFunction, data);
}

/**
 * parse log
 * @param abi abi
 * @param data log data
 * @returns parsed log data
 */
export function parseLog(abi: any, data: string) {
  const iface: any = _generateIface(abi);
  return iface.parseLog(data);
}

/**
 * encode event topic
 * @param abi abi
 * @param event event name
 * @returns encoded event topic
 */
export function encodeEventTopic(abi: any, event: string) {
  const iface: any = _generateIface(abi);
  return iface.getEventTopic(event);
}

/**
 * encode event
 * @param abi abi
 * @param event event name
 * @param filter with filter
 * @returns encode event with filter
 */
export function encodeEventFilterTopic(abi: any, event: string, filter: any[]) {
  const iface: any = _generateIface(abi);
  return iface.encodeFilterTopics(event, filter);
}

export function validResult(success: boolean, data: string) {
  return success && !isNullBytes(data);
}

function _generateIface(abi: any[]) {
  return new ethers.utils.Interface(abi);
}
