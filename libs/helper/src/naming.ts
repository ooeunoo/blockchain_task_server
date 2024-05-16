/**
 * pair symbol naming
 * @param token0 token0 { symbol }
 * @param token1 token1 { symbol }
 * @returns pair's name
 */
export function getPairTokenSymbol(
  token0: { symbol: string },
  token1: { symbol: string },
): string {
  return `${token0.symbol}-${token1.symbol}`;
}

/**
 * farm asset naming
 * @param stakeTokens stake tokens
 * @param rewardTokens  reward tokens
 * @returns farm asset's name
 */
export function getFarmAssetName(
  stakeTokens: { symbol: string }[],
  rewardTokens: { symbol: string }[],
): string {
  const stakeSymbols = stakeTokens.map(({ symbol }) => symbol).join('&');
  const rewardSymbols = rewardTokens.map(({ symbol }) => symbol).join('&');
  return `${stakeSymbols}/${rewardSymbols}`;
}
