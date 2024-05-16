/**
 * is special character
 * @param str string
 * @returns boolean
 */
export function checkSpecialCharacters(str: string): boolean {
  return /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi.test(str);
}

/**
 * is check space
 * @param str string
 * @returns  boolean
 */
export function checkSpace(str: string): boolean {
  return /\s/g.test(str);
}

/**
 *  is alphanumeric
 * @param str string
 * @returns boolean
 */
export function checkAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]*$/.test(str);
}

/**
 * is url
 * @param str string
 * @returns  boolean
 */
export function checkURI(str: string): boolean {
  return /(http(s)?:\/\/)([a-z0-9\w]+\.*)+[a-z0-9]{2,4}/gi.test(str);
}
