export type RateBase = Record<string, number>;

export interface CalculatedRate {
  symbol: string;
  value: number;
}

/**
 * All market rates are stored in one immutable USD-base representation.
 *
 * For FX, the base value is units of the currency per 1 USD.
 * Example: USD=1, EUR=.92, JPY=147.
 *
 * A user edit is an amount in the selected currency. The engine first
 * converts that amount to USD, then converts USD to every other currency.
 * The edited row is returned verbatim and is never recalculated.
 */
export function calculateFromAnchor(
  base: RateBase,
  anchorSymbol: string,
  anchorValue: number,
): CalculatedRate[] {
  const anchorPerUsd = base[anchorSymbol];

  if (
    !Number.isFinite(anchorValue) ||
    anchorValue <= 0 ||
    !Number.isFinite(anchorPerUsd) ||
    anchorPerUsd <= 0
  ) {
    return Object.entries(base).map(([symbol, value]) => ({ symbol, value }));
  }

  const usdAmount = anchorSymbol === 'USD'
    ? anchorValue
    : anchorValue / anchorPerUsd;

  return Object.entries(base).map(([symbol, perUsd]) => ({
    symbol,
    value: symbol === anchorSymbol
      ? anchorValue
      : usdAmount * perUsd,
  }));
}

export function normalizeBaseRates(rates: RateBase): RateBase {
  return {
    USD: 1,
    ...Object.fromEntries(
      Object.entries(rates).filter(
        ([symbol, value]) =>
          symbol !== 'USD' && Number.isFinite(value) && value > 0,
      ),
    ),
  };
}

export function convert(
  amount: number,
  fromSymbol: string,
  toSymbol: string,
  base: RateBase,
): number {
  const from = base[fromSymbol];
  const to = base[toSymbol];

  if (
    !Number.isFinite(amount) ||
    !Number.isFinite(from) ||
    !Number.isFinite(to) ||
    from <= 0 ||
    to <= 0
  ) {
    return 0;
  }

  const usdAmount = fromSymbol === 'USD' ? amount : amount / from;
  return toSymbol === 'USD' ? usdAmount : usdAmount * to;
}
