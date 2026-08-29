import {create} from 'zustand';

import {
    loadMobileState,
    saveMobileState,
} from './services/persistence/mobileStateStorage';

import {
    CRYPTO_DEFAULT_CATALOG,
    DEFAULT_CRYPTO,
    DEFAULT_FX,
    DEFAULT_METALS,
    DEFAULT_EQUITY,
    FX_CATALOG,
    METAL_CATALOG,
    REFRESH_INTERVAL_SECONDS,
} from './catalogs';

import {
    EQUITY_ORDER,
} from './catalogs/equities';

import {
    fetchCryptoCatalog,
} from './services/rates/cryptoCatalogService';

import {
    fetchCryptoForMobileService,
    fetchEquityForMobileService,
    fetchFxForMobileService,
    fetchMetalsForMobileService,
} from './services/rates/mobileServiceAdapters';

import {DecimalPlaces, MarketAsset, PersistedSettings, TabCategory, Tenor, ThemePreference} from './models';

export type {
    DecimalPlaces,
    MarketAsset,
    TabCategory,
    Tenor,
    ThemePreference,
};

export {
    DEFAULT_CRYPTO,
    DEFAULT_FX,
    DEFAULT_METALS,
    FX_CATALOG,
    METAL_CATALOG,
    CRYPTO_DEFAULT_CATALOG,
    REFRESH_INTERVAL_SECONDS,
};

export const TENOR_OPTIONS: Tenor[] = [
    '1D',
    '1W',
    '1M',
    '3M',
    '6M',
    '1Y',
];

const STORAGE_KEY = '@x2_mobile_settings_v5';

type Category = 'fx' | 'equity' | 'crypto' | 'metals';

type MarketSnapshot = {
    rate: number;
    referenceRate: number;
};

type CategoryState = {
    assets: Record<string, MarketAsset>;
    marketRates: Record<string, MarketSnapshot>;
    editedSymbol: string | null;
    editedValue: number | null;
};

interface MobileServiceState {
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

    /*
     * These are the currently visible assets only.
     *
     * They are materialized from the category-specific
     * state whenever activeTab changes.
     */
    assets: Record<string, MarketAsset>;

    /*
     * Kept for compatibility with the existing UI.
     *
     * Contains only the currently active category's anchor.
     */
    editedRates: Record<string, number>;

    /*
     * Kept for compatibility with existing UI.
     *
     * Contains only the currently active category's
     * immutable market/API rates.
     */
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

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */

/* -------------------------------------------------------------------------- */

function categoryForTab(
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

    // Support both legacy 'eq' and the newer 'equity' tab identifiers
    if (tab === 'eq' || tab === 'equity') {
        return 'equity';
    }

    return null;
}

function percentage(
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
                    asset.referenceRate ??
                    asset.rate,
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

function getCategoryState(
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

function setCategoryState(
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

/* -------------------------------------------------------------------------- */
/* Anchor calculation                                                         */
/* -------------------------------------------------------------------------- */

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
function calculateFiatOrMetalAnchor(
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
function calculateCryptoAnchor(
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

function calculateAnchor(
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

/* -------------------------------------------------------------------------- */
/* Display materialization                                                    */

/* -------------------------------------------------------------------------- */

function materializeCategory(
    category: Category,
): {
    assets: Record<string, MarketAsset>;
    editedRates: Record<string, number>;
    marketRates: Record<string, MarketSnapshot>;
} {
    const state =
        getCategoryState(category);

    return {
        assets: Object.fromEntries(
            Object.entries(state.assets).map(([k, a]) => [k, {...a, value: a.rate}]),
        ),

        editedRates:
            state.editedSymbol &&
            state.editedValue !== null
                ? {
                    [state.editedSymbol]:
                    state.editedValue,
                }
                : {},

        marketRates: {
            ...state.marketRates,
        },
    };
}

function materializeActiveCategory(
    state: MobileServiceState,
): Partial<MobileServiceState> {
    const category =
        categoryForTab(
            state.activeTab,
        );

    if (!category) {
        return {};
    }

    return materializeCategory(
        category,
    );
}

/* -------------------------------------------------------------------------- */
/* Persistence                                                                */
/* -------------------------------------------------------------------------- */

type PersistedMarketState = {
    fx?: {
        symbol: string | null;
        value: number | null;
    };

    crypto?: {
        symbol: string | null;
        value: number | null;
    };

    metals?: {
        symbol: string | null;
        value: number | null;
    };
};

function getCategoryTenor(
    category: Category,
): Tenor {
    if (category === 'fx') {
        return useMobileStore.getState().tenorFx;
    }

    if (category === 'crypto') {
        return useMobileStore.getState().tenorCrypto;
    }

    return useMobileStore.getState().tenorMetals;
}

async function persistState(
    state: MobileServiceState,
): Promise<void> {
    const persistedMarkets:
        PersistedMarketState = {
        fx: {
            symbol:
            fxState.editedSymbol,

            value:
            fxState.editedValue,
        },

        crypto: {
            symbol:
            cryptoState.editedSymbol,

            value:
            cryptoState.editedValue,
        },

        metals: {
            symbol:
            metalsState.editedSymbol,

            value:
            metalsState.editedValue,
        },
    };

    const settings: PersistedSettings & {
        marketState?: PersistedMarketState;
    } = {
        activeTab:
        state.activeTab,

        /*
         * Persist the tenor independently for
         * each market.
         */
        tenorFx:
        state.tenorFx,

        tenorCrypto:
        state.tenorCrypto,

        tenorMetals:
        state.tenorMetals,

        decimalPlaces:
        state.decimalPlaces,

        theme:
        state.theme,

        watchlistFx: [
            'USD',
            ...state.watchlistFx.filter(
                symbol =>
                    symbol !== 'USD',
            ),
        ],

        watchlistEquity: [
            ...state.watchlistEquity,
        ],

        watchlistCrypto: [
            'USD',
            ...state.watchlistCrypto.filter(
                symbol =>
                    symbol !== 'USD',
            ),
        ],

        watchlistMetals: [
            'USD',
            ...state.watchlistMetals.filter(
                symbol =>
                    symbol !== 'USD',
            ),
        ],

        editedRates:
        state.editedRates,

        marketState:
        persistedMarkets,
    };

    await saveMobileState(
        settings,
    );
}

/* -------------------------------------------------------------------------- */
/* Watchlists                                                                 */

/* -------------------------------------------------------------------------- */

function getWatchlist(
    state: MobileServiceState,
    category: TabCategory,
): string[] {
    if (category === 'fx') {
        return state.isEditMode
            ? state.editWatchlistFx
            : state.watchlistFx;
    }

    if (category === 'equity') {
        return state.isEditMode
            ? state.editWatchlistEquity
            : state.watchlistEquity;
    }

    if (category === 'crypto') {
        return state.isEditMode
            ? state.editWatchlistCrypto
            : state.watchlistCrypto;
    }

    if (category === 'metals') {
        return state.isEditMode
            ? state.editWatchlistMetals
            : state.watchlistMetals;
    }

    return [];
}

/* -------------------------------------------------------------------------- */
/* Initial store                                                              */
/* -------------------------------------------------------------------------- */

export const useMobileStore =
    create<MobileServiceState>(
        (set, get) => ({
            activeTab: 'fx',

            tenorFx: '1D',
            tenorCrypto: '1W',
            tenorMetals: '1M',

            decimalPlaces: 4,

            theme: 'system',

            isOnline: true,

            isLoading: false,

            lastSynced: 0,

            countdown:
            REFRESH_INTERVAL_SECONDS,

            isEditMode: false,

            watchlistFx: [
                ...DEFAULT_FX,
            ],

            watchlistEquity: [
                'SENSEX',
                'NIFTY50',
                ...EQUITY_ORDER.map(item => item.symbol).filter(s => s !== 'SENSEX' && s !== 'NIFTY50'),
            ],

            watchlistCrypto: [
                ...DEFAULT_CRYPTO,
            ],

            watchlistMetals: [
                ...DEFAULT_METALS,
            ],

            editWatchlistFx: [
                ...DEFAULT_FX,
            ],

            editWatchlistEquity: [
                'SENSEX',
                'NIFTY50',
                ...EQUITY_ORDER.map(item => item.symbol).filter(s => s !== 'SENSEX' && s !== 'NIFTY50'),
            ],

            editWatchlistCrypto: [
                ...DEFAULT_CRYPTO,
            ],

            editWatchlistMetals: [
                ...DEFAULT_METALS,
            ],

            assets:
            materializeCategory('fx')
                .assets,

            editedRates: {},

            marketRates:
            materializeCategory('fx')
                .marketRates,

            cryptoCatalog: [
                ...CRYPTO_DEFAULT_CATALOG,
            ],

            /* ------------------------------------------------------------------ */
            /* Settings                                                            */
            /* ------------------------------------------------------------------ */

            setActiveTab: tab => {
                set({
                    activeTab: tab,

                    ...materializeActiveCategory({
                        ...get(),
                        activeTab: tab,
                    }),
                });

                void persistState(
                    get(),
                ).catch(
                    () => undefined,
                );
            },

            setTenor: tenor => {
                const state = get();

                if (state.activeTab === 'fx') {
                    set({
                        tenorFx: tenor,
                    });
                } else if (state.activeTab === 'crypto') {
                    set({
                        tenorCrypto: tenor,
                    });
                } else if (state.activeTab === 'metals') {
                    set({
                        tenorMetals: tenor,
                    });
                }

                void persistState(
                    get(),
                ).catch(
                    () => undefined,
                );

                void get().forceRefresh();
            },

            setDecimalPlaces: value => {
                set({
                    decimalPlaces: value,
                });

                void persistState(
                    get(),
                ).catch(
                    () => undefined,
                );
            },

            setTheme: value => {
                set({
                    theme: value,
                });

                void persistState(
                    get(),
                ).catch(
                    () => undefined,
                );
            },

            /* ------------------------------------------------------------------ */
            /* Editing                                                             */
            /* ------------------------------------------------------------------ */

            updateAssetRate: (
                symbol,
                rate,
            ) => {
                if (
                    !Number.isFinite(rate) ||
                    rate <= 0
                ) {
                    return;
                }

                const state =
                    get();

                const category =
                    categoryForTab(
                        state.activeTab,
                    );

                if (!category) {
                    return;
                }

                const categoryState =
                    getCategoryState(category);

                if (!categoryState) {
                    return;
                }

                const asset =
                    categoryState.assets[symbol];

                const market =
                    categoryState.marketRates[symbol];

                if (!asset || !market) {
                    return;
                }

                /*
                 * A new edit ALWAYS replaces the
                 * previous anchor for THIS category.
                 *
                 * USD -> 2
                 * EUR -> 2
                 *
                 * EUR becomes the new anchor.
                 *
                 * Crypto can have its own anchor
                 * simultaneously with FX.
                 */
                const next =
                    calculateAnchor(
                        category,
                        categoryState,
                        symbol,
                        rate,
                    );

                setCategoryState(
                    category,
                    next,
                );

                set({
                    ...materializeCategory(
                        category,
                    ),
                });

                void persistState(
                    get(),
                ).catch(
                    () => undefined,
                );
            },

            clearEditedRate: symbol => {
                const state =
                    get();

                const category =
                    categoryForTab(
                        state.activeTab,
                    );

                if (!category) {
                    return;
                }

                const categoryState =
                    getCategoryState(
                        category,
                    );

                if (
                    categoryState.editedSymbol !==
                    symbol
                ) {
                    return;
                }

                const assets: Record<
                    string,
                    MarketAsset
                > = {};

                Object.entries(
                    categoryState.marketRates,
                ).forEach(
                    ([itemSymbol, snapshot]) => {
                        const original =
                            categoryState.assets[
                                itemSymbol
                                ];

                        if (!original) {
                            return;
                        }

                        assets[itemSymbol] = {
                            ...original,

                            rate:
                            snapshot.rate,

                            referenceRate:
                            snapshot.referenceRate,

                            changePct:
                                percentage(
                                    snapshot.rate,
                                    snapshot.referenceRate,
                                ),

                            isCustomEdited:
                                false,
                        };
                    },
                );

                setCategoryState(
                    category,
                    {
                        ...categoryState,

                        assets,

                        editedSymbol:
                            null,

                        editedValue:
                            null,
                    },
                );

                set({
                    ...materializeCategory(
                        category,
                    ),
                });

                void persistState(
                    get(),
                ).catch(
                    () => undefined,
                );
            },

            /* ------------------------------------------------------------------ */
            /* Watchlist editing                                                   */
            /* ------------------------------------------------------------------ */

            startEditing: () => {
                const state =
                    get();

                set({
                    isEditMode: true,

                    editWatchlistFx:
                        [...state.watchlistFx],

                    editWatchlistCrypto:
                        [...state.watchlistCrypto],

                    editWatchlistMetals:
                        [...state.watchlistMetals],
                });
            },

            applyEditing: async () => {
                const state =
                    get();

                const fx = [
                    'USD',
                    ...state.editWatchlistFx.filter(
                        symbol =>
                            symbol !== 'USD',
                    ),
                ];

                const crypto = [
                    'USD',
                    ...state.editWatchlistCrypto.filter(
                        symbol =>
                            symbol !== 'USD',
                    ),
                ];

                const metals = [
                    'USD',
                    ...state.editWatchlistMetals.filter(
                        symbol => symbol !== 'USD',
                    ),
                ];

                set({
                    watchlistFx: fx,

                    watchlistCrypto:
                    crypto,

                    watchlistMetals:
                    metals,

                    isEditMode: false,
                });

                await persistState(
                    get(),
                );
            },

            cancelEditing: () => {
                const state =
                    get();

                set({
                    isEditMode: false,

                    editWatchlistFx:
                        [...state.watchlistFx],

                    editWatchlistCrypto:
                        [...state.watchlistCrypto],

                    editWatchlistMetals:
                        [...state.watchlistMetals],
                });
            },

            reorderWatchlist: (
                category,
                order,
            ) => {
                if (category === 'fx') {
                    set({
                        editWatchlistFx: [
                            'USD',
                            ...order.filter(
                                symbol =>
                                    symbol !== 'USD',
                            ),
                        ],
                    });

                    return;
                }

                if (
                    category === 'crypto'
                ) {
                    set({
                        editWatchlistCrypto: [
                            'USD',
                            ...order.filter(
                                symbol =>
                                    symbol !== 'USD',
                            ),
                        ],
                    });

                    return;
                }

                if (
                    category === 'metals'
                ) {
                    set({
                        editWatchlistMetals: [
                            'USD',
                            ...order.filter(
                                symbol =>
                                    symbol !== 'USD',
                            ),
                        ],
                    });
                }
            },

            addAssetToWatchlist: (
                category,
                symbol,
            ) => {
                const state =
                    get();

                const current =
                    getWatchlist(
                        state,
                        category,
                    );

                if (
                    current.includes(symbol)
                ) {
                    return;
                }

                const next = [
                    ...current,
                    symbol,
                ];

                if (category === 'fx') {
                    set({
                        editWatchlistFx: [
                            'USD',
                            ...next.filter(
                                item =>
                                    item !== 'USD',
                            ),
                        ],
                    });

                    return;
                }

                if (
                    category === 'crypto'
                ) {
                    set({
                        editWatchlistCrypto: [
                            'USD',
                            ...next.filter(
                                item =>
                                    item !== 'USD',
                            ),
                        ],
                    });

                    // Fetch latest crypto rates so the new coin doesn't show zeros
                    void get().forceRefresh();

                    return;
                }

                set({
                    editWatchlistMetals: [
                        'USD',
                        ...next.filter(
                            item =>
                                item !== 'USD',
                        ),
                    ],
                });

            },

            removeAssetFromWatchlist: (
                category,
                symbol,
            ) => {
                /*
                 * USD is permanently present
                 * in FX and Crypto.
                 */
                if (
                    (
                        category === 'fx' ||
                        category === 'crypto' ||
                        category === 'metals'
                    ) &&
                    symbol === 'USD'
                ) {
                    return;
                }

                const state =
                    get();

                const current =
                    getWatchlist(
                        state,
                        category,
                    );

                const next =
                    current.filter(
                        item =>
                            item !== symbol,
                    );

                if (category === 'fx') {
                    set({
                        editWatchlistFx: [
                            'USD',
                            ...next.filter(
                                item =>
                                    item !== 'USD',
                            ),
                        ],
                    });
                } else if (
                    category === 'crypto'
                ) {
                    set({
                        editWatchlistCrypto: [
                            'USD',
                            ...next.filter(
                                item =>
                                    item !== 'USD',
                            ),
                        ],
                    });
                } else {
                    set({
                        editWatchlistMetals:
                        next,
                    });
                }

                /*
                 * If the removed item was the
                 * active anchor, reset ONLY that
                 * category.
                 */
                const categoryState =
                    getCategoryState(
                        category,
                    );

                if (
                    categoryState.editedSymbol ===
                    symbol
                ) {
                    const assets: Record<
                        string,
                        MarketAsset
                    > = {};

                    Object.entries(
                        categoryState.marketRates,
                    ).forEach(
                        ([itemSymbol, snapshot]) => {
                            const original =
                                categoryState.assets[
                                    itemSymbol
                                    ];

                            if (!original) {
                                return;
                            }

                            assets[itemSymbol] = {
                                ...original,

                                rate:
                                snapshot.rate,

                                referenceRate:
                                snapshot.referenceRate,

                                changePct:
                                    percentage(
                                        snapshot.rate,
                                        snapshot.referenceRate,
                                    ),

                                isCustomEdited:
                                    false,
                            };
                        },
                    );

                    setCategoryState(
                        category,
                        {
                            ...categoryState,

                            assets,

                            editedSymbol:
                                null,

                            editedValue:
                                null,
                        },
                    );

                    set({
                        ...materializeCategory(
                            category,
                        ),
                    });
                }

                void persistState(
                    get(),
                ).catch(
                    () => undefined,
                );
            },

            resetMarketDefaults: async () => {
                /*
                 * Reset ONLY FX, Crypto and Metals.
                 * Theme, decimal places and active tab
                 * remain unchanged.
                 */

                const fxDefaults = [
                    ...DEFAULT_FX,
                ];

                const cryptoDefaults = [
                    'USD',
                    ...CRYPTO_DEFAULT_CATALOG.map(
                        asset => asset.symbol,
                    ),
                ];

                const metalsDefaults = [
                    'USD',
                    ...DEFAULT_METALS.filter(
                        symbol => symbol !== 'USD',
                    ),
                ];

                /*
                 * Reset the underlying category states.
                 */
                fxState =
                    createCategoryState('fx');

                cryptoState =
                    createCategoryState('crypto');

                metalsState =
                    createCategoryState('metals');

                /*
                 * Crypto default anchor: BTC = 1
                 */
                cryptoState = {
                    ...cryptoState,

                    editedSymbol:
                        'bitcoin',

                    editedValue:
                        1,
                };

                /*
                 * Metals always starts with USD first
                 * and XAU_1OZ as the default anchor.
                 */
                metalsState = {
                    ...metalsState,

                    editedSymbol:
                        'XAU_1OZ',

                    editedValue:
                        1,
                };

                /*
                 * Restore the actual Zustand state used
                 * by the screens and edit mode.
                 */
                // Apply core reset values first so state updates immediately.
                set({
                    watchlistFx: fxDefaults,

                    watchlistCrypto:
                    cryptoDefaults,

                    watchlistMetals:
                    metalsDefaults,

                    editWatchlistFx:
                        [...fxDefaults],

                    editWatchlistCrypto:
                        [...cryptoDefaults],

                    editWatchlistMetals:
                        [...metalsDefaults],

                    // Reset per-market tenors to defaults
                    tenorFx: '1D',

                    tenorCrypto: '1W',

                    tenorMetals: '1M',

                    // Reset theme and decimal places to app defaults
                    theme: 'system',

                    decimalPlaces: 4,

                    // Exit edit mode so UI shows the active watchlists
                    isEditMode: false,
                });

                /*
                 * Persist the complete reset state.
                 */
                await persistState(
                    get(),
                );

                // Materialize the active category now that core settings are applied.
                set({
                    ...materializeActiveCategory(
                        get(),
                    ),
                });

                // Re-run the existing setActiveTab logic for the current tab to ensure all
                // derived values and listeners are updated the same way as a tab switch.
                // This triggers the materialization path that the UI uses elsewhere.
                void get().setActiveTab(get().activeTab);

                /*
                 * Refresh using the newly restored
                 * per-screen tenors and watchlists.
                 */
                await get().forceRefresh();
            },
            /* ------------------------------------------------------------------ */
            /* Refresh                                                             */
            /* ------------------------------------------------------------------ */

            forceRefresh: async () => {
                if (
                    get().isLoading
                ) {
                    return;
                }

                const state =
                    get();

                set({
                    isLoading: true,
                });

                try {
                    const cryptoIds =
                        state.watchlistCrypto.filter(
                            symbol =>
                                symbol !== 'USD',
                        );

                    const [
                        fx,
                        equity,
                        crypto,
                        metals,
                    ] = await Promise.all([
                        fetchFxForMobileService(
                            state.tenorFx,
                        ),

                        fetchEquityForMobileService(),

                        fetchCryptoForMobileService(
                            state.tenorCrypto,
                            cryptoIds,
                        ),

                        fetchMetalsForMobileService(
                            state.tenorMetals,
                        ),
                    ]);

                    /*
                     * IMPORTANT:
                     *
                     * Each API result updates ONLY
                     * its own category.
                     */
                    const mergeCategory = (
                        category: Category,
                        data: Record<
                            string,
                            {
                                rate: number;
                                referenceRate: number;
                                changePct: number;
                            }
                        >,
                    ) => {
                        const current =
                            getCategoryState(
                                category,
                            );

                        const marketRates = {
                            ...current.marketRates,
                        };

                        const baseAssets = {
                            ...current.assets,
                        };

                        Object.entries(
                            data,
                        ).forEach(
                            ([symbol, value]) => {
                                const existing =
                                    baseAssets[
                                        symbol
                                        ];

                                if (!existing) {
                                    return;
                                }

                                marketRates[
                                    symbol
                                    ] = {
                                    rate:
                                    value.rate,

                                    referenceRate:
                                    value.referenceRate,
                                };

                                baseAssets[
                                    symbol
                                    ] = {
                                    ...existing,

                                    rate:
                                    value.rate,

                                    referenceRate:
                                    value.referenceRate,

                                    changePct:
                                    value.changePct,

                                    isCustomEdited:
                                        false,
                                };
                            },
                        );

                        /*
                         * Crypto USD is synthetic.
                         *
                         * Its raw market value is always 1.
                         * Its displayed value is recalculated
                         * from the crypto anchor below.
                         */
                        if (
                            category === 'crypto'
                        ) {
                            baseAssets.USD = {
                                ...baseAssets.USD,

                                symbol: 'USD',

                                name: 'US Dollar',

                                rate: 1,

                                referenceRate: 1,

                                changePct: 0,

                                category: 'crypto',
                            };

                            marketRates.USD = {
                                rate: 1,

                                referenceRate: 1,
                            };
                        }

                        let next: CategoryState = {
                            ...current,

                            assets:
                            baseAssets,

                            marketRates,

                            editedSymbol:
                            current.editedSymbol,

                            editedValue:
                            current.editedValue,
                        };

                        /*
                         * Reapply THIS CATEGORY'S anchor
                         * against the fresh API data.
                         *
                         * Never use previously displayed
                         * values as the source.
                         */
                        if (
                            next.editedSymbol &&
                            next.editedValue !== null
                        ) {
                            next =
                                calculateAnchor(
                                    category,
                                    next,
                                    next.editedSymbol,
                                    next.editedValue,
                                );
                        }

                        setCategoryState(
                            category,
                            next,
                        );
                    };

                    mergeCategory(
                        'fx',
                        fx,
                    );

                    mergeCategory(
                        'equity',
                        equity,
                    );

                    mergeCategory(
                        'crypto',
                        crypto,
                    );

                    mergeCategory(
                        'metals',
                        metals,
                    );

                    const active =
                        get();

                    set({
                        ...materializeActiveCategory(
                            active,
                        ),

                        isLoading: false,

                        isOnline: true,

                        lastSynced:
                            Date.now(),

                        countdown:
                        REFRESH_INTERVAL_SECONDS,
                    });
                } catch {
                    set({
                        isLoading: false,

                        isOnline: false,

                        countdown:
                        REFRESH_INTERVAL_SECONDS,
                    });
                }
            },

            tickCountdown: () => {
                const state =
                    get();

                if (
                    state.countdown <= 1
                ) {
                    set({
                        countdown:
                        REFRESH_INTERVAL_SECONDS,
                    });

                    void get()
                        .forceRefresh();

                    return;
                }

                set({
                    countdown:
                        state.countdown - 1,
                });
            },

            /* ------------------------------------------------------------------ */
            /* Crypto catalogue                                                    */
            /* ------------------------------------------------------------------ */

            loadCryptoCatalog:
                async () => {
                    try {
                        const catalog =
                            await fetchCryptoCatalog();

                        if (
                            !catalog.length
                        ) {
                            return;
                        }

                        const current =
                            getCategoryState(
                                'crypto',
                            );

                        const assets = {
                            ...current.assets,
                        };

                        const marketRates = {
                            ...current.marketRates,
                        };

                        catalog.forEach(
                            coin => {
                                const existing =
                                    assets[
                                        coin.id
                                        ];

                                assets[
                                    coin.id
                                    ] = {
                                    symbol:
                                    coin.id,

                                    id:
                                    coin.id,

                                    displaySymbol:
                                    coin.symbol,

                                    name:
                                    coin.name,

                                    rate:
                                        existing?.rate ??
                                        0,

                                    referenceRate:
                                        existing?.referenceRate ??
                                        0,

                                    changePct:
                                        existing?.changePct ??
                                        0,

                                    category:
                                        'crypto',

                                    isCustomEdited:
                                        existing?.isCustomEdited ??
                                        false,
                                };

                                if (
                                    !marketRates[
                                        coin.id
                                        ]
                                ) {
                                    marketRates[
                                        coin.id
                                        ] = {
                                        rate:
                                            existing?.rate ??
                                            0,

                                        referenceRate:
                                            existing?.referenceRate ??
                                            0,
                                    };
                                }
                            },
                        );

                        /*
                         * USD is a fixed crypto quote row.
                         *
                         * It is NOT the same USD as FX.
                         */
                        assets.USD = {
                            symbol: 'USD',

                            name: 'US Dollar',

                            rate: 1,

                            referenceRate: 1,

                            changePct: 0,

                            category: 'crypto',
                        };

                        marketRates.USD = {
                            rate: 1,

                            referenceRate: 1,
                        };

                        setCategoryState(
                            'crypto',
                            {
                                ...current,

                                assets,

                                marketRates,
                            },
                        );

                        set({
                            cryptoCatalog:
                                catalog.map(
                                    coin => ({
                                        symbol:
                                        coin.id,

                                        id:
                                        coin.id,

                                        displaySymbol:
                                        coin.symbol,

                                        name:
                                        coin.name,

                                        rate:
                                            assets[
                                                coin.id
                                                ]?.rate ?? 0,

                                        referenceRate:
                                            assets[
                                                coin.id
                                                ]?.referenceRate ??
                                            0,

                                        changePct:
                                            assets[
                                                coin.id
                                                ]?.changePct ??
                                            0,

                                        category:
                                            'crypto',
                                    }),
                                ),
                            ...(
                                get().activeTab ===
                                'crypto'
                                    ? materializeCategory(
                                        'crypto',
                                    )
                                    : {}
                            ),
                        });
                    } catch {
                        /*
                         * Keep bundled catalogue.
                         */
                    }
                },

            /* ------------------------------------------------------------------ */
            /* Initialization                                                      */
            /* ------------------------------------------------------------------ */

            initialize:
                async () => {
                    try {
                        const saved =
                            await loadMobileState();

                        if (saved) {
                            const fx =
                                saved.watchlistFx?.length
                                    ? saved.watchlistFx
                                    : DEFAULT_FX;

                            const crypto =
                                saved.watchlistCrypto?.length
                                    ? saved.watchlistCrypto
                                    : DEFAULT_CRYPTO;

                            const metals = [
                                'USD',
                                ...(saved.watchlistMetals?.length
                                        ? saved.watchlistMetals
                                        : DEFAULT_METALS
                                ).filter(
                                    symbol => symbol !== 'USD',
                                ),
                            ];

                            set({
                                activeTab:
                                    saved.activeTab ??
                                    'fx',

                                tenorFx:
                                    saved.tenorFx ??
                                    '1D',

                                tenorCrypto:
                                    saved.tenorCrypto ??
                                    '1W',

                                tenorMetals:
                                    saved.tenorMetals ??
                                    '1M',

                                decimalPlaces:
                                    saved.decimalPlaces ??
                                    4,

                                theme:
                                    saved.theme ??
                                    'system',

                                watchlistFx: [
                                    'USD',
                                    ...fx.filter(
                                        symbol =>
                                            symbol !==
                                            'USD',
                                    ),
                                ],

                                watchlistCrypto: [
                                    'USD',
                                    ...crypto.filter(
                                        symbol =>
                                            symbol !==
                                            'USD',
                                    ),
                                ],

                                watchlistMetals:
                                metals,

                                // Ensure SENSEX and NIFTY50 remain at the top of equities
                                watchlistEquity: [
                                    'SENSEX',
                                    'NIFTY50',
                                    ...(saved.watchlistEquity?.length ? saved.watchlistEquity : DEFAULT_EQUITY).filter(s => s !== 'SENSEX' && s !== 'NIFTY50'),
                                ],

                                editWatchlistFx: [
                                    'USD',
                                    ...fx.filter(
                                        symbol =>
                                            symbol !==
                                            'USD',
                                    ),
                                ],

                                editWatchlistCrypto: [
                                    'USD',
                                    ...crypto.filter(
                                        symbol =>
                                            symbol !==
                                            'USD',
                                    ),
                                ],

                                editWatchlistMetals:
                                metals,

                                // Mirror the same SENSEX/NIFTY ordering for edit list
                                editWatchlistEquity: [
                                    'SENSEX',
                                    'NIFTY50',
                                    ...(saved.watchlistEquity?.length ? saved.watchlistEquity : DEFAULT_EQUITY).filter(s => s !== 'SENSEX' && s !== 'NIFTY50'),
                                ],
                            });

                            /*
                             * New persistence format:
                             *
                             * FX anchor is independent.
                             * Crypto anchor is independent.
                             * Metals anchor is independent.
                             */
                            const persisted =
                                saved.marketState;

                            if (persisted) {
                                if (
                                    persisted.fx?.symbol &&
                                    persisted.fx.value !== null &&
                                    Number.isFinite(
                                        persisted.fx.value,
                                    )
                                ) {
                                    fxState = {
                                        ...fxState,

                                        editedSymbol:
                                        persisted.fx.symbol,

                                        editedValue:
                                        persisted.fx.value,
                                    };
                                }

                                if (
                                    persisted.crypto?.symbol &&
                                    persisted.crypto.value !== null &&
                                    Number.isFinite(
                                        persisted.crypto.value,
                                    )
                                ) {
                                    cryptoState = {
                                        ...cryptoState,

                                        editedSymbol:
                                        persisted.crypto.symbol,

                                        editedValue:
                                        persisted.crypto.value,
                                    };
                                }

                                if (
                                    persisted.metals?.symbol &&
                                    persisted.metals.value !== null &&
                                    Number.isFinite(
                                        persisted.metals.value,
                                    )
                                ) {
                                    metalsState = {
                                        ...metalsState,

                                        editedSymbol:
                                        persisted.metals.symbol,

                                        editedValue:
                                        persisted.metals.value,
                                    };
                                }
                            }
                        }
                    } catch {
                        /*
                         * Defaults remain.
                         */
                    }

                    /*
                     * Load dynamic crypto catalogue first.
                     */
                    await get()
                        .loadCryptoCatalog();

                    /*
                     * Fetch current market values.
                     *
                     * Each category is refreshed independently.
                     */
                    await get()
                        .forceRefresh();

                    /*
                     * Crypto default:
                     *
                     * BTC = 1
                     *
                     * This is applied ONLY when there is
                     * no persisted crypto anchor.
                     */
                    const crypto =
                        getCategoryState(
                            'crypto',
                        );

                    if (
                        !crypto.editedSymbol &&
                        crypto.marketRates.bitcoin &&
                        crypto.marketRates.bitcoin.rate > 0
                    ) {
                        const next =
                            calculateCryptoAnchor(
                                crypto,
                                'bitcoin',
                                1,
                            );

                        setCategoryState(
                            'crypto',
                            next,
                        );
                    }

                    /*
                     * Metals default:
                     *
                     * XAU_1OZ = 1
                     *
                     * This makes gold the default anchor and
                     * expresses USD and all other metals relative
                     * to one troy ounce of gold.
                     */
                    const metals =
                        getCategoryState(
                            'metals',
                        );

                    if (
                        !metals.editedSymbol &&
                        metals.marketRates.XAU_1OZ &&
                        metals.marketRates.XAU_1OZ.rate > 0
                    ) {
                        const next =
                            calculateCryptoAnchor(
                                metals,
                                'XAU_1OZ',
                                1,
                            );

                        setCategoryState(
                            'metals',
                            next,
                        );
                    }

                    const state =
                        get();

                    set({
                        ...materializeActiveCategory(
                            state,
                        ),

                        isOnline: true,

                        lastSynced:
                            Date.now(),

                        countdown:
                        REFRESH_INTERVAL_SECONDS,
                    });
                },
        }),
    );