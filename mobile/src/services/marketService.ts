import {
    CRYPTO_DEFAULT_CATALOG,
    DEFAULT_EQUITY,
    FX_CATALOG,
    METAL_CATALOG,
} from '../catalogs';

import {EQUITY_ORDER} from '../catalogs/equities';

import type {
    MarketAsset,
    TabCategory,
} from '../models';

export type Category =
    | 'fx'
    | 'equity'
    | 'crypto'
    | 'metals';

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

    if (tab === 'eq' || tab === 'equity') {
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
        (((rate - reference) / reference) * 100).toFixed(2),
    );
}

function cloneAssets(
    assets: MarketAsset[],
): Record<string, MarketAsset> {
    return Object.fromEntries(
        assets.map(asset => [
            asset.symbol,
            {...asset},
        ]),
    );
}

function cloneMarketRates(
    assets: MarketAsset[],
): Record<string, MarketSnapshot> {
    return Object.fromEntries(
        assets.map(asset => [
            asset.symbol,
            {
                rate: asset.rate,
                referenceRate:
                    asset.referenceRate ?? asset.rate,
            },
        ]),
    );
}

function createCryptoAssets(): MarketAsset[] {
    return [
        {
            symbol: 'USD',
            name: 'US Dollar',
            rate: 1,
            referenceRate: 1,
            changePct: 0,
            category: 'crypto',
        },
        ...CRYPTO_DEFAULT_CATALOG,
    ];
}

function createCategoryState(
    category: Category,
): CategoryState {
    const catalog =
        category === 'fx'
            ? FX_CATALOG
            : category === 'equity'
                ? EQUITY_ORDER.map(item => ({
                    symbol: item.symbol,
                    name: item.name,
                    rate: 0,
                    referenceRate: 0,
                    changePct: 0,
                    category: 'equity' as const,
                }))
                : category === 'metals'
                    ? [
                        {
                            symbol: 'USD',
                            name: 'US Dollar',
                            rate: 1,
                            referenceRate: 1,
                            changePct: 0,
                            category: 'metals' as const,
                        },
                        ...METAL_CATALOG,
                    ]
                    : createCryptoAssets();

    return {
        assets: cloneAssets(catalog),
        marketRates: cloneMarketRates(catalog),
        editedSymbol: null,
        editedValue: null,
    };
}

let fxState = createCategoryState('fx');
let equityState = createCategoryState('equity');
let cryptoState = createCategoryState('crypto');
let metalsState = createCategoryState('metals');

export function getCategoryState(
    category: Category,
): CategoryState {
    if (category === 'fx') {
        return fxState;
    }

    if (category === 'crypto') {
        return cryptoState;
    }

    if (category === 'equity') {
        return equityState;
    }

    return metalsState;
}

export function setCategoryState(
    category: Category,
    value: CategoryState,
): void {
    if (category === 'fx') {
        fxState = value;
        return;
    }

    if (category === 'crypto') {
        cryptoState = value;
        return;
    }

    if (category === 'equity') {
        equityState = value;
        return;
    }

    metalsState = value;
}

export function calculateFiatOrMetalAnchor(
    state: CategoryState,
    symbol: string,
    value: number,
): CategoryState {
    const anchorMarket = state.marketRates[symbol];

    if (
        !anchorMarket ||
        !Number.isFinite(anchorMarket.rate) ||
        anchorMarket.rate <= 0 ||
        !Number.isFinite(value) ||
        value <= 0
    ) {
        return state;
    }

    const ratio = value / anchorMarket.rate;
    const assets: Record<string, MarketAsset> = {};

    Object.entries(state.marketRates).forEach(
        ([itemSymbol, snapshot]) => {
            const original = state.assets[itemSymbol];
            if (!original) {
                return;
            }

            const rate = snapshot.rate * ratio;
            const referenceRate = snapshot.referenceRate * ratio;

            assets[itemSymbol] = {
                ...original,
                rate,
                referenceRate,
                changePct: percentage(rate, referenceRate),
                isCustomEdited: itemSymbol === symbol,
            };
        },
    );

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

export function calculateCryptoAnchor(
    state: CategoryState,
    symbol: string,
    value: number,
): CategoryState {
    const anchorMarket = state.marketRates[symbol];

    if (
        !anchorMarket ||
        !Number.isFinite(anchorMarket.rate) ||
        anchorMarket.rate <= 0 ||
        !Number.isFinite(value) ||
        value <= 0
    ) {
        return state;
    }

    const assets: Record<string, MarketAsset> = {};

    if (symbol === 'USD') {
        Object.entries(state.marketRates).forEach(
            ([itemSymbol, snapshot]) => {
                const original = state.assets[itemSymbol];
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

                const rate =
                    Number.isFinite(snapshot.rate) && snapshot.rate !== 0
                        ? value / snapshot.rate
                        : 0;

                const referenceRate =
                    Number.isFinite(snapshot.referenceRate) && snapshot.referenceRate !== 0
                        ? value / snapshot.referenceRate
                        : 0;

                assets[itemSymbol] = {
                    ...original,
                    rate,
                    referenceRate,
                    changePct: percentage(rate, referenceRate),
                    isCustomEdited: false,
                };
            },
        );
    } else {
        const anchorUsd = value * anchorMarket.rate;
        const anchorReferenceUsd = value * anchorMarket.referenceRate;

        Object.entries(state.marketRates).forEach(
            ([itemSymbol, snapshot]) => {
                const original = state.assets[itemSymbol];
                if (!original) {
                    return;
                }

                if (itemSymbol === 'USD') {
                    assets[itemSymbol] = {
                        ...original,
                        rate: anchorUsd,
                        referenceRate: anchorReferenceUsd,
                        changePct: percentage(
                            anchorUsd,
                            anchorReferenceUsd,
                        ),
                        isCustomEdited: false,
                    };
                    return;
                }

                const rate =
                    Number.isFinite(snapshot.rate) && snapshot.rate !== 0
                        ? anchorUsd / snapshot.rate
                        : 0;

                const referenceRate =
                    Number.isFinite(snapshot.referenceRate) && snapshot.referenceRate !== 0
                        ? anchorReferenceUsd / snapshot.referenceRate
                        : 0;

                assets[itemSymbol] = {
                    ...original,
                    rate,
                    referenceRate,
                    changePct: percentage(rate, referenceRate),
                    isCustomEdited: itemSymbol === symbol,
                };
            },
        );

        if (assets[symbol]) {
            const anchorReferenceForAsset =
                anchorMarket.rate !== 0
                    ? value * (anchorMarket.referenceRate / anchorMarket.rate)
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
    if (category === 'crypto') {
        return calculateCryptoAnchor(state, symbol, value);
    }

    if (category === 'equity') {
        return state;
    }

    return calculateFiatOrMetalAnchor(state, symbol, value);
}

export function materializeCategory(
    category: Category,
): {
    assets: Record<string, MarketAsset>;
    editedRates: Record<string, number>;
    marketRates: Record<string, MarketSnapshot>;
} {
    const state = getCategoryState(category);

    return {
        assets: Object.fromEntries(
            Object.entries(state.assets).map(
                ([key, asset]) => [
                    key,
                    {...asset, value: asset.rate},
                ],
            ),
        ),
        editedRates:
            state.editedSymbol && state.editedValue !== null
                ? {[state.editedSymbol]: state.editedValue}
                : {},
        marketRates: {...state.marketRates},
    };
}

export function materializeActiveCategory(
    activeTab: TabCategory,
): Partial<{
    assets: Record<string, MarketAsset>;
    editedRates: Record<string, number>;
    marketRates: Record<string, MarketSnapshot>;
}> {
    const category = categoryForTab(activeTab);
    return category ? materializeCategory(category) : {};
}

export function resetMarketStates(): void {
    fxState = createCategoryState('fx');
    equityState = createCategoryState('equity');
    cryptoState = createCategoryState('crypto');
    metalsState = createCategoryState('metals');
}

export function getDefaultEquityWatchlist(): string[] {
    return [...DEFAULT_EQUITY];
}
