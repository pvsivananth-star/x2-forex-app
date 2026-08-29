import type {
    MarketAsset,
    TabCategory,
    Tenor,
} from '../models';

export const TAB_TITLES: Record<TabCategory, string> = {
    fx: 'Forex',
    equity: 'Equities',
    crypto: 'Crypto',
    metals: 'Metals',
    portfolio: 'Portfolio',
};

export function getWatchlistForTab(
    tab: TabCategory,
    isEditMode: boolean,
    state: {
        watchlistFx: string[];
        watchlistEquity: string[];
        watchlistCrypto: string[];
        watchlistMetals: string[];
        editWatchlistFx: string[];
        editWatchlistEquity: string[];
        editWatchlistCrypto: string[];
        editWatchlistMetals: string[];
    },
): string[] {
    if (tab === 'fx') {
        return isEditMode
            ? state.editWatchlistFx
            : state.watchlistFx;
    }

    if (tab === 'equity') {
        return isEditMode
            ? state.editWatchlistEquity
            : state.watchlistEquity;
    }

    if (tab === 'crypto') {
        return isEditMode
            ? state.editWatchlistCrypto
            : state.watchlistCrypto;
    }

    if (tab === 'metals') {
        return isEditMode
            ? state.editWatchlistMetals
            : state.watchlistMetals;
    }

    return [];
}

export function getActiveTenor(
    tab: TabCategory,
    tenors: {
        tenorFx: Tenor;
        tenorCrypto: Tenor;
        tenorMetals: Tenor;
    },
): Tenor | null {
    if (tab === 'fx') {
        return tenors.tenorFx;
    }

    if (tab === 'crypto') {
        return tenors.tenorCrypto;
    }

    if (tab === 'metals') {
        return tenors.tenorMetals;
    }

    return null;
}

export function getVisibleAssets(
    watchlist: string[],
    assets: Record<string, MarketAsset>,
): MarketAsset[] {
    return watchlist
        .map(symbol => assets[symbol])
        .filter(
            (asset): asset is MarketAsset =>
                Boolean(asset),
        );
}

export function filterCatalog(
    catalog: MarketAsset[],
    search: string,
): MarketAsset[] {
    const query = search.trim().toLowerCase();

    if (!query) {
        return catalog;
    }

    return catalog.filter(asset =>
        asset.name.toLowerCase().includes(query) ||
        (asset.displaySymbol ?? asset.symbol)
            .toLowerCase()
            .includes(query) ||
        asset.symbol.toLowerCase().includes(query),
    );
}
