export type RateBase = Record<string, number>;

export interface CalculatedRate {
    symbol: string;
    value: number;
}

/**
 * All FX rates are stored as USD per 1 unit of currency.
 *
 * Example:
 * USD = 1
 * EUR = 1.16
 * JPY = 0.00645
 *
 * A user edit is an amount in the selected currency. The engine first
 * converts that amount to USD, then converts the USD amount into every
 * other currency using USD-per-unit rates.
 *
 * The edited row is returned verbatim and is never recalculated.
 */
export function calculateFromAnchor(
    base: RateBase,
    anchorSymbol: string,
    anchorValue: number,
): CalculatedRate[] {
    const anchorUsdPerUnit = base[anchorSymbol];

    if (
        !Number.isFinite(anchorValue) ||
        anchorValue <= 0 ||
        !Number.isFinite(anchorUsdPerUnit) ||
        anchorUsdPerUnit <= 0
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
            : anchorValue * anchorUsdPerUnit;

    return Object.entries(base).map(
        ([symbol, usdPerUnit]) => ({
            symbol,
            value:
                symbol === anchorSymbol
                    ? anchorValue
                    : symbol === 'USD'
                        ? usdAmount
                        : usdAmount / usdPerUnit,
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
    const fromUsdPerUnit = base[fromSymbol];
    const toUsdPerUnit = base[toSymbol];

    if (
        !Number.isFinite(amount) ||
        !Number.isFinite(fromUsdPerUnit) ||
        !Number.isFinite(toUsdPerUnit) ||
        fromUsdPerUnit <= 0 ||
        toUsdPerUnit <= 0
    ) {
        return 0;
    }

    const usdAmount =
        fromSymbol === 'USD'
            ? amount
            : amount * fromUsdPerUnit;

    return toSymbol === 'USD'
        ? usdAmount
        : usdAmount / toUsdPerUnit;
}
