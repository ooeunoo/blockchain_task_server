import * as _ from 'lodash';

export function isEmpty(object: any) {
  return Object.keys(object).length === 0;
}

export function get(object: any, path: string) {
  return _.get(object, path);
}
