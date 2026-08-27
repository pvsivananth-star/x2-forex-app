import { MarketRate } from '../models/market';

/**
 * Every displayed value is derived from the untouched market snapshot.
 * A new edit replaces the previous anchor.
 */
export function calculateAnchoredRates(
  marketRates: MarketRate[],
  anchorSymbol: string | null,
  anchorValue: number,
): MarketRate[] {
  if (!anchorSymbol || !Number.isFinite(anchorValue) || anchorValue <= 0) {
    return marketRates;
  }

  const anchor = marketRates.find(x => x.symbol === anchorSymbol);
  if (!anchor || !Number.isFinite(anchor.value) || anchor.value <= 0) {
    return marketRates;
  }

  const scale = anchorValue / anchor.value;

  return marketRates.map(item => ({
    ...item,
    value: item.symbol === anchorSymbol
      ? anchorValue
      : item.value * scale,
  }));
}
