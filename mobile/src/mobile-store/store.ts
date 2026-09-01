import {create} from 'zustand';

import {
    CRYPTO_DEFAULT_CATALOG,
    DEFAULT_CRYPTO,
    DEFAULT_FX,
    DEFAULT_METALS,
    DEFAULT_EQUITY,
    FX_CATALOG,
    METAL_CATALOG,
    REFRESH_INTERVAL_SECONDS,
} from '../catalogs';

import {
    EQUITY_ORDER,
} from '../catalogs/equities';

import {services} from '../services/serviceContainer';

import type {
    Category,
    CategoryState,
    MarketSnapshot,
} from '../utils/rateEngine';

import {
    calculateAnchor,
    calculateCryptoAnchor,
    categoryForTab,
    percentage,
} from '../utils/rateEngine';

import type {
    DecimalPlaces,
    MarketAsset,
    PersistedMarketState,
    PersistedSettings,
    TabCategory,
    Tenor,
    ThemePreference
} from '../models';

import {
    materializeCategory,
    materializeActiveCategory,
    persistState as _persistState,
} from './materialize';

import {
    cloneAssets,
    cloneMarketRates,
    createCryptoAssets,
    createCategoryState,
    getCategoryState,
    setCategoryState,
} from './helpers';

import type { MobileServiceState } from './types';

export {
    DEFAULT_CRYPTO,
    DEFAULT_FX,
    DEFAULT_METALS,
    FX_CATALOG,
    METAL_CATALOG,
    CRYPTO_DEFAULT_CATALOG,
    REFRESH_INTERVAL_SECONDS,
};

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

                void _persistState(
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

                void _persistState(
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

                void _persistState(
                    get(),
                ).catch(
                    () => undefined,
                );
            },

            setTheme: value => {
                set({
                    theme: value,
                });

                void _persistState(
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

                void _persistState(
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
                > = {} as any;

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
                        } as any;
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

                void _persistState(
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

                await _persistState(
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
                    // getWatchlist logic inlined here to avoid an extra import
                    category === 'fx'
                        ? (state.isEditMode ? state.editWatchlistFx : state.watchlistFx)
                        : category === 'equity'
                            ? (state.isEditMode ? state.editWatchlistEquity : state.watchlistEquity)
                            : category === 'crypto'
                                ? (state.isEditMode ? state.editWatchlistCrypto : state.watchlistCrypto)
                                : (state.isEditMode ? state.editWatchlistMetals : state.watchlistMetals);

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
                    category === 'fx'
                        ? (state.isEditMode ? state.editWatchlistFx : state.watchlistFx)
                        : category === 'equity'
                            ? (state.isEditMode ? state.editWatchlistEquity : state.watchlistEquity)
                            : category === 'crypto'
                                ? (state.isEditMode ? state.editWatchlistCrypto : state.watchlistCrypto)
                                : (state.isEditMode ? state.editWatchlistMetals : state.watchlistMetals);

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

                const categoryState =
                    getCategoryState(
                        category === 'portfolio' ? 'fx' : category,
                    );

                if (
                    categoryState.editedSymbol ===
                    symbol
                ) {
                    const assets: Record<
                        string,
                        MarketAsset
                    > = {} as any;

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
                            } as any;
                        },
                    );

                    setCategoryState(
                        category === 'portfolio' ? 'fx' : category,
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
                            category === 'portfolio' ? 'fx' : category,
                        ),
                    });
                }

                void _persistState(
                    get(),
                ).catch(
                    () => undefined,
                );
            },

            resetMarketDefaults: async () => {
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

                // Reset underlying category states using helpers' setters
                setCategoryState('fx', createCategoryState('fx'));

                setCategoryState('crypto', createCategoryState('crypto'));

                setCategoryState('metals', createCategoryState('metals'));

                // Apply crypto default anchor: BTC = 1
                const _cryptoState = getCategoryState('crypto');
                setCategoryState('crypto', {
                    ..._cryptoState,
                    editedSymbol: 'bitcoin',
                    editedValue: 1,
                });

                // Metals default anchor: XAU_1OZ = 1
                const _metalsState = getCategoryState('metals');
                setCategoryState('metals', {
                    ..._metalsState,
                    editedSymbol: 'XAU_1OZ',
                    editedValue: 1,
                });

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

                    tenorFx: '1D',

                    tenorCrypto: '1W',

                    tenorMetals: '1M',

                    theme: 'system',

                    decimalPlaces: 4,

                    isEditMode: false,
                });

                await _persistState(
                    get(),
                );

                set({
                    ...materializeActiveCategory(
                        get(),
                    ),
                });

                void get().setActiveTab(get().activeTab);

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
                        services.rates.refreshRates({
                            market: 'fx',
                            tenor: state.tenorFx,
                        }),

                        services.rates.refreshRates({
                            market: 'equity'
                        }),

                        services.rates.refreshRates({
                            market: 'crypto',
                            tenor: state.tenorCrypto,
                            symbols: state.watchlistCrypto,
                        }),

                        services.rates.refreshRates({
                            market: 'metals',
                            tenor: state.tenorMetals,
                        }),
                    ]);

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
                                } as any;
                            },
                        );

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
                            } as any;

                            marketRates.USD = {
                                rate: 1,

                                referenceRate: 1,
                            } as any;
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
                        } as any;

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
                            await services.catalog.getItems('crypto');

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
                        } as any;

                        const marketRates = {
                            ...current.marketRates,
                        } as any;

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
                                } as any;

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
                                    } as any;
                                }
                            },
                        );

                        assets.USD = {
                            symbol: 'USD',

                            name: 'US Dollar',

                            rate: 1,

                            referenceRate: 1,

                            changePct: 0,

                            category: 'crypto',
                        } as any;

                        marketRates.USD = {
                            rate: 1,

                            referenceRate: 1,
                        } as any;

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
                        
                    }
                },

            /* ------------------------------------------------------------------ */
            /* Initialization                                                      */
            /* ------------------------------------------------------------------ */

            initialize:
                async () => {
                    try {
                        const saved =
                            await services.persistence.load();

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

                                editWatchlistEquity: [
                                    'SENSEX',
                                    'NIFTY50',
                                    ...(saved.watchlistEquity?.length ? saved.watchlistEquity : DEFAULT_EQUITY).filter(s => s !== 'SENSEX' && s !== 'NIFTY50'),
                                ],
                            });

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
                                    setCategoryState('fx', {
                                        ...getCategoryState('fx'),
                                        editedSymbol: persisted.fx.symbol,
                                        editedValue: persisted.fx.value,
                                    } as any);
                                }

                                if (
                                    persisted.crypto?.symbol &&
                                    persisted.crypto.value !== null &&
                                    Number.isFinite(
                                        persisted.crypto.value,
                                    )
                                ) {
                                    setCategoryState('crypto', {
                                        ...getCategoryState('crypto'),
                                        editedSymbol: persisted.crypto.symbol,
                                        editedValue: persisted.crypto.value,
                                    } as any);
                                }

                                if (
                                    persisted.metals?.symbol &&
                                    persisted.metals.value !== null &&
                                    Number.isFinite(
                                        persisted.metals.value,
                                    )
                                ) {
                                    setCategoryState('metals', {
                                        ...getCategoryState('metals'),
                                        editedSymbol: persisted.metals.symbol,
                                        editedValue: persisted.metals.value,
                                    } as any);
                                }
                            }
                        }
                    } catch {
                    }

                    await get()
                        .loadCryptoCatalog();

                    await get()
                        .forceRefresh();

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
