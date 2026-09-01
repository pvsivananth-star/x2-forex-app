import {
    CRYPTO_DEFAULT_CATALOG,
    DEFAULT_CRYPTO,
    DEFAULT_FX,
    DEFAULT_METALS,
    FX_CATALOG,
    METAL_CATALOG,
} from '../catalogs';

import {
    EQUITY_ORDER,
} from '../catalogs/equities';

import type {
    Category,
    CategoryState,
} from '../utils/rateEngine';

import type { MarketAsset, MarketSnapshot } from './types';

export function cloneAssets(
    assets: MarketAsset[],
): Record<string, MarketAsset> {
    return Object.fromEntries(
        assets.map(asset => [
            asset.symbol,
            { ...asset },
        ]),
    );
}

export function cloneMarketRates(
    assets: MarketAsset[],
): Record<string, MarketSnapshot> {
    return Object.fromEntries(
        assets.map(asset => [
            asset.symbol,
            {
                rate: asset.rate,
                referenceRate:
                    asset.referenceRate ??
                    asset.rate,
            },
        ]),
    );
}

export function createCryptoAssets(): MarketAsset[] {
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

export function createCategoryState(
    category: Category,
): CategoryState {
    const catalog =
        category === 'fx'
            ? FX_CATALOG
            : category === 'equity'
                ? EQUITY_ORDER.map(
                    item => ({
                        symbol: item.symbol,
                        name: item.name,
                        rate: 0,
                        referenceRate: 0,
                        changePct: 0,
                        category: 'equity' as const,
                    }),
                )
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

        marketRates:
            cloneMarketRates(catalog),

        editedSymbol: null,

        editedValue: null,
    };
}

let fxState =
    createCategoryState('fx');

let equityState =
    createCategoryState('equity');

let cryptoState =
    createCategoryState('crypto');

let metalsState =
    createCategoryState('metals');

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
