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

export function createInitialCategoryState(
    category: Category,
): CategoryState {
    const assets = category === 'fx'
        ? FX_CATALOG
        : category === 'equity'
            ? DEFAULT_EQUITY
            : category === 'crypto'
                ? CRYPTO_DEFAULT_CATALOG
                : METAL_CATALOG;

    return {
        assets: cloneAssets(assets),
        marketRates: {},
        editedSymbol: null,
        editedValue: null,
    };
}

export function equityOrder(): string[] {
    return EQUITY_ORDER.map(item => item.symbol);
}
