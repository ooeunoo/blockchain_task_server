import * as _ from 'lodash';

/**
 * to flat array
 * @param array target array
 * @param all flat all
 * @returns flat array
 */
export function flat(array: any[], all?: boolean) {
  return all ? array.flat(Infinity) : array.flat();
}

/**
 * 연속 넘버 배열
 * @param number 갯수
 * @param start 시작 인덱스
 * @returns sequence number array
 */
export function fillSequenceNumber(number: number, start = 0) {
  return Array.from({ length: number }, (_, i) => i + start);
}

/**
 * chunk로 분리된 array
 * @param array target array
 * @param chunkSize chunk
 * @returns chunk array
 */
export function toSplitWithChunkSize(array: any[], chunkSize: number) {
  return _.chunk(array, chunkSize);
}

/**
 * 랜덤 값
 * @param array target array
 * @returns random one
 */
export function randomPick(array: any[]) {
  return _.sample(array);
}

/**
 * key로 그룹화된 object
 * @param array target array
 * @param key group by this key
 * @returns object grouped by key
 */
export function groupBy(array: any[], key: string) {
  return _.groupBy(array, key);
}

/**
 * 동일 값 제거
 * @param array target array
 * @param removeArray removal values
 * @returns removed value array
 */
export function removeStringValues(array: any[], removeArray: any[]) {
  const lowerArray = _.map(array, _.method('toLowerCase'));
  const lowerRemoveArray = _.map(removeArray, _.method('toLowerCase'));

  if (lowerRemoveArray.length == 0) {
    return lowerArray;
  }

  return _.without(lowerArray, ...lowerRemoveArray);
}

/**
 * zip
 * @param array target array
 * @param otherArray other array
 * @returns zip array
 */
export function zip(array: any[], otherArray: any[]) {
  return _.zip(array, otherArray);
}

/**
 * remove falsey value (false, null, 0, "", undefined, NAN)
 * @param array target array
 * @returns removed falsey array
 */
export function removeFalsey(array: any[]) {
  return _.compact(array);
}

/**
 * remove null value
 * @param array target array
 * @returns removed null array
 */
export function removeNull(array: any[]) {
  return _.without(array, null);
}
