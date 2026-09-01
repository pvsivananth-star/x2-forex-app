import type { DecimalPlaces, MarketAsset, PersistedMarketState, PersistedSettings, TabCategory, Tenor, ThemePreference } from '../models';
import type { MarketSnapshot } from '../utils/rateEngine';

export type {
    DecimalPlaces,
    MarketAsset,
    TabCategory,
    Tenor,
    ThemePreference,
    PersistedMarketState,
    PersistedSettings,
    MarketSnapshot,
};

export const TENOR_OPTIONS: Tenor[] = [
    '1D',
    '1W',
    '1M',
    '3M',
    '6M',
    '1Y',
];

export const STORAGE_KEY = '@x2_mobile_settings_v5';

export interface MobileServiceState {
    activeTab: TabCategory;

    tenorFx: Tenor;
    tenorCrypto: Tenor;
    tenorMetals: Tenor;

    decimalPlaces: DecimalPlaces;

    theme: ThemePreference;

    isOnline: boolean;

    isLoading: boolean;

    lastSynced: number;

    countdown: number;

    isEditMode: boolean;

    watchlistFx: string[];

    watchlistEquity: string[];

    watchlistCrypto: string[];

    watchlistMetals: string[];

    editWatchlistFx: string[];

    editWatchlistEquity: string[];

    editWatchlistCrypto: string[];

    editWatchlistMetals: string[];

    assets: Record<string, MarketAsset>;

    editedRates: Record<string, number>;

    marketRates: Record<string, MarketSnapshot>;

    cryptoCatalog: MarketAsset[];

    setActiveTab: (tab: TabCategory) => void;

    setTenor: (tenor: Tenor) => void;

    setDecimalPlaces: (value: DecimalPlaces) => void;

    setTheme: (value: ThemePreference) => void;

    updateAssetRate: (
        symbol: string,
        rate: number,
    ) => void;

    clearEditedRate: (
        symbol: string,
    ) => void;

    startEditing: () => void;

    applyEditing: () => Promise<void>;

    cancelEditing: () => void;

    resetMarketDefaults: () => Promise<void>;

    reorderWatchlist: (
        category: TabCategory,
        order: string[],
    ) => void;

    addAssetToWatchlist: (
        category: TabCategory,
        symbol: string,
    ) => void;

    removeAssetFromWatchlist: (
        category: TabCategory,
        symbol: string,
    ) => void;

    forceRefresh: () => Promise<void>;

    tickCountdown: () => void;

    initialize: () => Promise<void>;

    loadCryptoCatalog: () => Promise<void>;
}
