import {MarketAsset, TabCategory} from '../models';

export type RateBase = Record<string, number>;

export interface CalculatedRate {
    symbol: string;
    value: number;
}

/*
 * -----------------------------------------------------------------------
 * Category anchor engine
 *
 * Moved from MobileService.ts unchanged (business calculation only -
 * no Zustand, no React, no persistence, no API calls). MobileService.ts
 * still owns the mutable per-category state (fxState/cryptoState/etc.)
 * and calls into these pure functions with an explicit CategoryState
 * snapshot; the engine never reads or holds that state itself.
 * -----------------------------------------------------------------------
 */

export type Category = 'fx' | 'equity' | 'crypto' | 'metals';

export type MarketSnapshot = {
    rate: number;
    referenceRate: number;
};

export type CategoryState = {
    assets: Record<string, MarketAsset>;
    marketRates: Record<string, MarketSnapshot>;
    editedSymbol: string | null;
    editedValue: number | null;
};

export function categoryForTab(
    tab: TabCategory,
): Category | null {
    if (tab === 'fx') {
        return 'fx';
    }

    if (tab === 'crypto') {
        return 'crypto';
    }

    if (tab === 'metals') {
        return 'metals';
    }

    if (tab === 'equity') {
        return 'equity';
    }

    return null;
}

export function percentage(
    rate: number,
    reference: number,
): number {
    if (
        !Number.isFinite(rate) ||
        !Number.isFinite(reference) ||
        reference === 0
    ) {
        return 0;
    }

    return Number(
        (
            ((rate - reference) / reference) *
            100
        ).toFixed(2),
    );
}

/*
 * FX / Metals
 *
 * Market rates are USD-based:
 *
 * USD = 1
 * EUR = 0.85
 * JPY = 150
 *
 * If EUR is edited to 2:
 *
 * USD = 1 / 0.85 * 2
 * JPY = 150 / 0.85 * 2
 *
 * Every calculation starts from marketRates.
 *
 * It NEVER uses an already calculated/displayed value.
 */
export function calculateFiatOrMetalAnchor(
    state: CategoryState,
    symbol: string,
    value: number,
): CategoryState {
    const anchorMarket =
        state.marketRates[symbol];

    if (
        !anchorMarket ||
        !Number.isFinite(anchorMarket.rate) ||
        anchorMarket.rate <= 0 ||
        !Number.isFinite(value) ||
        value <= 0
    ) {
        return state;
    }

    const ratio =
        value / anchorMarket.rate;

    const assets: Record<
        string,
        MarketAsset
    > = {};

    Object.entries(
        state.marketRates,
    ).forEach(
        ([itemSymbol, snapshot]) => {
            const original =
                state.assets[itemSymbol];

            if (!original) {
                return;
            }

            const rate =
                snapshot.rate * ratio;

            const referenceRate =
                snapshot.referenceRate * ratio;

            assets[itemSymbol] = {
                ...original,

                rate,

                referenceRate,

                changePct:
                    percentage(
                        rate,
                        referenceRate,
                    ),

                isCustomEdited:
                    itemSymbol === symbol,
            };
        },
    );

    /*
     * Guarantee the exact value entered
     * by the user.
     */
    if (assets[symbol]) {
        assets[symbol] = {
            ...assets[symbol],

            rate: value,

            isCustomEdited: true,
        };
    }

    return {
        ...state,

        assets,

        editedSymbol: symbol,

        editedValue: value,
    };
}

/*
 * Crypto
 *
 * Crypto API values are USD per coin:
 *
 * BTC = 100000 USD
 * ETH = 4000 USD
 *
 * Normal/default display:
 *
 * USD = 1
 * BTC = 100000
 * ETH = 4000
 *
 * If BTC is edited to 1:
 *
 * BTC = 1
 * USD = 100000
 * ETH = 4000 / 100000
 *
 * Therefore crypto is NOT calculated using the same
 * "units per USD" interpretation as FX.
 */
export function calculateCryptoAnchor(
    state: CategoryState,
    symbol: string,
    value: number,
): CategoryState {
    const anchorMarket =
        state.marketRates[symbol];

    if (
        !anchorMarket ||
        !Number.isFinite(anchorMarket.rate) ||
        anchorMarket.rate <= 0 ||
        !Number.isFinite(value) ||
        value <= 0
    ) {
        return state;
    }

    const assets: Record<
        string,
        MarketAsset
    > = {};

    /*
     * Crypto market rates are USD per coin.
     *
     * Example:
     *
     * BTC = 80367 USD
     * SOL = 100 USD
     *
     * BTC = 1
     * USD = 80367
     * SOL = 803.67
     *
     * USD = 10000
     * BTC = 10000 / 80367
     * SOL = 10000 / 100
     */

    if (symbol === 'USD') {
        Object.entries(
            state.marketRates,
        ).forEach(
            ([itemSymbol, snapshot]) => {
                const original =
                    state.assets[itemSymbol];

                if (!original) {
                    return;
                }

                if (itemSymbol === 'USD') {
                    assets[itemSymbol] = {
                        ...original,

                        rate: value,

                        referenceRate: value,

                        changePct: 0,

                        isCustomEdited: true,
                    };

                    return;
                }

                const rate = Number.isFinite(snapshot.rate) && snapshot.rate !== 0 ? value / snapshot.rate : 0;

                const referenceRate = Number.isFinite(snapshot.referenceRate) && snapshot.referenceRate !== 0 ? value / snapshot.referenceRate : 0;

                assets[itemSymbol] = {
                    ...original,

                    rate,

                    referenceRate,

                    changePct:
                        percentage(
                            rate,
                            referenceRate,
                        ),

                    isCustomEdited: false,
                };
            },
        );
    } else {
        /*
         * A crypto coin is the anchor.
         *
         * First calculate its USD value.
         *
         * Then calculate every other crypto
         * from that same USD value.
         */
        const anchorUsd =
            value * anchorMarket.rate;

        const anchorReferenceUsd =
            value *
            anchorMarket.referenceRate;

        Object.entries(
            state.marketRates,
        ).forEach(
            ([itemSymbol, snapshot]) => {
                const original =
                    state.assets[itemSymbol];

                if (!original) {
                    return;
                }

                if (itemSymbol === 'USD') {
                    assets[itemSymbol] = {
                        ...original,

                        rate: anchorUsd,

                        referenceRate:
                        anchorReferenceUsd,

                        changePct:
                            percentage(
                                anchorUsd,
                                anchorReferenceUsd,
                            ),

                        isCustomEdited: false,
                    };

                    return;
                }

                const rate = Number.isFinite(snapshot.rate) && snapshot.rate !== 0 ? anchorUsd / snapshot.rate : 0;

                const referenceRate = Number.isFinite(snapshot.referenceRate) && snapshot.referenceRate !== 0 ? anchorReferenceUsd / snapshot.referenceRate : 0;

                assets[itemSymbol] = {
                    ...original,

                    rate,

                    referenceRate,

                    changePct:
                        percentage(
                            rate,
                            referenceRate,
                        ),

                    isCustomEdited:
                        itemSymbol === symbol,
                };
            },
        );

        /*
         * Guarantee exact value entered.
         */
        if (assets[symbol]) {
            const anchorSnapshot = anchorMarket;

            const anchorReferenceForAsset =
                anchorSnapshot && Number.isFinite(anchorSnapshot.rate) && anchorSnapshot.rate !== 0
                    ? value * (anchorSnapshot.referenceRate / anchorSnapshot.rate)
                    : value;

            assets[symbol] = {
                ...assets[symbol],

                rate: value,

                referenceRate: anchorReferenceForAsset,

                changePct: percentage(value, anchorReferenceForAsset),

                isCustomEdited: true,
            };
        }
    }

    return {
        ...state,

        assets,

        editedSymbol: symbol,

        editedValue: value,
    };
}

export function calculateAnchor(
    category: Category,
    state: CategoryState,
    symbol: string,
    value: number,
): CategoryState {
    if (
        category === 'crypto' ||
        category === 'metals'
    ) {
        return calculateCryptoAnchor(
            state,
            symbol,
            value,
        );
    }

    return calculateFiatOrMetalAnchor(
        state,
        symbol,
        value,
    );
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
