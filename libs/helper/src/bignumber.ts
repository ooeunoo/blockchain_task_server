import BigNumber from 'bignumber.js';

BigNumber.config({ EXPONENTIAL_AT: 100 });

export function toBigNumber(value: any) {
  return new BigNumber(value.toString());
}

export function isZero(value: any) {
  return new BigNumber(value.toString()).isZero();
}

export function toFixed(value: any, point = 20) {
  return new BigNumber(value.toString()).toFixed(point);
}

export function toNegated(value: any) {
  return new BigNumber(value.toString()).negated();
}

export function shift(value: any, n: number) {
  return new BigNumber(value.toString()).shiftedBy(n);
}

export function add(a: any, b: any) {
  return new BigNumber(a.toString()).plus(b.toString());
}

export function sub(a: any, b: any) {
  return new BigNumber(a.toString()).minus(b.toString());
}

export function mul(a: any, b: any) {
  return new BigNumber(a.toString()).multipliedBy(b.toString());
}

export function div(a: any, b: any) {
  return new BigNumber(a.toString()).div(b.toString());
}

export function pow(a: any, b: any) {
  return new BigNumber(a.toString()).pow(b.toString());
}

export function isGreaterThan(a: any, b: any) {
  return new BigNumber(a.toString()).isGreaterThan(b.toString());
}

export function isGreaterThanOrEqual(a: any, b: any) {
  return new BigNumber(a.toString()).isGreaterThanOrEqualTo(b.toString());
}

export function isLessThan(a: any, b: any) {
  return new BigNumber(a.toString()).isLessThan(b.toString());
}

export function isLessThanOrEqual(a: any, b: any) {
  return new BigNumber(a.toString()).isLessThanOrEqualTo(b.toString());
}
