export interface CrossRateResult {
    convertedValue: number;
    unitLabel: string;
}

/**
 * Calculates converted amount and unit equivalency.
 * Rates are relative to USD base (e.g., USD = 1.0, EUR = 0.92, INR = 83.5).
 */
export const calculateCrossRate = (
    amount: number,
    fromRate: number,
    toRate: number,
    fromSymbol: string,
    toSymbol: string,
    precision: number = 2
): CrossRateResult => {
    if (!fromRate || !toRate || amount <= 0) {
        return { convertedValue: 0, unitLabel: '' };
    }

    // Cross rate calculation via USD baseline
    const convertedValue = (amount / fromRate) * toRate;

    // Single unit ratio comparison
    const rateRatio = toRate / fromRate;
    let unitLabel = '';

    if (rateRatio >= 1) {
        unitLabel = `1 ${fromSymbol} = ${rateRatio.toFixed(precision)} ${toSymbol}`;
    } else {
        const inverseRatio = 1 / rateRatio;
        unitLabel = `1 ${toSymbol} = ${inverseRatio.toFixed(precision)} ${fromSymbol}`;
    }

    return { convertedValue, unitLabel };
};
