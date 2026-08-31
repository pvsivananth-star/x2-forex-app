export type RateBase = Record<string, number>;

export interface CalculatedRate {
    symbol: string;
    value: number;
}

/**
 * All FX rates are stored as currency units per 1 USD.
 *
 * Example:
 * USD = 1
 * EUR = 0.86
 * JPY = 155
 *
 * A user edit is an amount in the selected currency. The engine first
 * converts that amount to USD, then converts the USD amount into every
 * other currency using currency-per-USD rates.
 *
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
        return Object.entries(base).map(
            ([symbol, value]) => ({
                symbol,
                value,
            }),
        );
    }

    const usdAmount =
        anchorSymbol === 'USD'
            ? anchorValue
            : anchorValue / anchorPerUsd;

    return Object.entries(base).map(
        ([symbol, perUsd]) => ({
            symbol,
            value:
                symbol === anchorSymbol
                    ? anchorValue
                    : symbol === 'USD'
                        ? usdAmount
                        : usdAmount * perUsd,
        }),
    );
}

export function normalizeBaseRates(
    rates: RateBase,
): RateBase {
    return {
        USD: 1,
        ...Object.fromEntries(
            Object.entries(rates).filter(
                ([symbol, value]) =>
                    symbol !== 'USD' &&
                    Number.isFinite(value) &&
                    value > 0,
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
    const fromPerUsd = base[fromSymbol];
    const toPerUsd = base[toSymbol];

    if (
        !Number.isFinite(amount) ||
        !Number.isFinite(fromPerUsd) ||
        !Number.isFinite(toPerUsd) ||
        fromPerUsd <= 0 ||
        toPerUsd <= 0
    ) {
        return 0;
    }

    const usdAmount =
        fromSymbol === 'USD'
            ? amount
            : amount / fromPerUsd;

    return toSymbol === 'USD'
        ? usdAmount
        : usdAmount * toPerUsd;
}
