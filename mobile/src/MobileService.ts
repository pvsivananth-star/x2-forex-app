import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import {
  DEFAULT_CRYPTO,
  DEFAULT_FX,
  DEFAULT_METALS,
  FX_CATALOG,
  METAL_CATALOG,
  CRYPTO_DEFAULT_CATALOG,
  REFRESH_INTERVAL_SECONDS,
} from './catalogs';

import {
  fetchCryptoCatalog,
  fetchCryptoData,
  fetchFxData,
  fetchMetalsData,
} from './ratesApi';

import {
  DecimalPlaces,
  MarketAsset,
  PersistedSettings,
  TabCategory,
  Tenor,
  ThemePreference,
} from './types';

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

const STORAGE_KEY =
    '@x2_mobile_settings_v4';

type MarketSnapshot = {
  rate: number;
  referenceRate: number;
};

interface MobileServiceState {
  activeTab: TabCategory;

  tenor: Tenor;

  decimalPlaces: DecimalPlaces;

  theme: ThemePreference;

  isOnline: boolean;

  isLoading: boolean;

  lastSynced: number;

  countdown: number;

  isEditMode: boolean;

  watchlistFx: string[];

  watchlistCrypto: string[];

  watchlistMetals: string[];

  editWatchlistFx: string[];

  editWatchlistCrypto: string[];

  editWatchlistMetals: string[];

  assets: Record<string, MarketAsset>;

  /*
   * Only ONE active manual rate anchor exists.
   *
   * Example:
   *
   * EUR = 2
   *
   * means every other rate is calculated
   * relative to the real market EUR rate.
   */
  editedRates: Record<string, number>;

  /*
   * Unmodified market/API values.
   *
   * Displayed rates are always calculated from
   * this map, never from another already-adjusted
   * displayed rate.
   */
  marketRates: Record<
      string,
      MarketSnapshot
  >;

  cryptoCatalog: MarketAsset[];

  setActiveTab: (
      tab: TabCategory,
  ) => void;

  setTenor: (
      tenor: Tenor,
  ) => void;

  setDecimalPlaces: (
      value: DecimalPlaces,
  ) => void;

  setTheme: (
      value: ThemePreference,
  ) => void;

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

function createAssetMap(): Record<
    string,
    MarketAsset
> {
  const map: Record<
      string,
      MarketAsset
  > = {};

  [
    ...FX_CATALOG,
    ...CRYPTO_DEFAULT_CATALOG,
  ].forEach((asset) => {
    map[asset.symbol] = {
      ...asset,
    };
  });

  /*
   * Crypto always has a USD row.
   */
  map.USD = {
    symbol: 'USD',
    name: 'US Dollar',
    rate: 1,
    referenceRate: 1,
    changePct: 0,
    category: 'crypto',
  };

  METAL_CATALOG.forEach(
      (asset) => {
        map[asset.symbol] = {
          ...asset,
        };
      },
  );

  return map;
}

function createInitialMarketRates():
    Record<string, MarketSnapshot> {
  const map: Record<
      string,
      MarketSnapshot
  > = {};

  [
    ...FX_CATALOG,
    ...CRYPTO_DEFAULT_CATALOG,
    ...METAL_CATALOG,
  ].forEach((asset) => {
    map[asset.symbol] = {
      rate: asset.rate,
      referenceRate:
          asset.referenceRate ??
          asset.rate,
    };
  });

  map.USD = {
    rate: 1,
    referenceRate: 1,
  };

  return map;
}

function getWatchlist(
    state: MobileServiceState,
    category: TabCategory,
): string[] {
  if (category === 'fx') {
    return state.isEditMode
        ? state.editWatchlistFx
        : state.watchlistFx;
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

function getCategoryForSymbol(
    symbol: string,
    state: MobileServiceState,
): 'fx' | 'crypto' | 'metals' | null {
  if (
      state.watchlistFx.includes(symbol) ||
      state.editWatchlistFx.includes(symbol)
  ) {
    return 'fx';
  }

  if (
      symbol === 'USD' ||
      state.watchlistCrypto.includes(symbol) ||
      state.editWatchlistCrypto.includes(symbol)
  ) {
    return 'crypto';
  }

  if (
      state.watchlistMetals.includes(symbol) ||
      state.editWatchlistMetals.includes(symbol)
  ) {
    return 'metals';
  }

  const asset =
      state.assets[symbol];

  if (!asset) {
    return null;
  }

  return asset.category;
}

async function persistState(
    state: MobileServiceState,
) {
  const settings: PersistedSettings = {
    activeTab: state.activeTab,
    tenor: state.tenor,
    decimalPlaces:
    state.decimalPlaces,
    theme: state.theme,

    watchlistFx:
    state.watchlistFx,

    watchlistCrypto:
    state.watchlistCrypto,

    watchlistMetals:
    state.watchlistMetals,

    editedRates:
    state.editedRates,
  };

  await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(settings),
  );
}

function calculatePercentage(
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
          (
              (rate - reference) /
              reference
          ) * 100
      ).toFixed(2),
  );
}

function applyAnchor(
    assets: Record<
        string,
        MarketAsset
    >,
    marketRates: Record<
        string,
        MarketSnapshot
    >,
    editedRates: Record<
        string,
        number
    >,
    category:
        | 'fx'
        | 'crypto'
        | 'metals',
) {
  const anchorSymbol =
      Object.keys(
          editedRates,
      )[0];

  if (!anchorSymbol) {
    return;
  }

  const anchorAsset =
      assets[anchorSymbol];

  const anchorMarket =
      marketRates[anchorSymbol];

  if (
      !anchorAsset ||
      !anchorMarket ||
      anchorAsset.category !==
      category
  ) {
    return;
  }

  const editedValue =
      editedRates[
          anchorSymbol
          ];

  if (
      !Number.isFinite(
          editedValue,
      ) ||
      editedValue <= 0 ||
      !Number.isFinite(
          anchorMarket.rate,
      ) ||
      anchorMarket.rate <= 0
  ) {
    return;
  }

  const scale =
      editedValue /
      anchorMarket.rate;

  Object.entries(
      marketRates,
  ).forEach(
      ([symbol, snapshot]) => {
        const asset =
            assets[symbol];

        if (
            !asset ||
            asset.category !==
            category
        ) {
          return;
        }

        const displayedRate =
            snapshot.rate *
            scale;

        const displayedReference =
            snapshot.referenceRate *
            scale;

        assets[symbol] = {
          ...asset,

          rate:
          displayedRate,

          referenceRate:
          displayedReference,

          changePct:
              calculatePercentage(
                  displayedRate,
                  displayedReference,
              ),

          isCustomEdited:
              symbol ===
              anchorSymbol,
        };
      },
  );

  /*
   * Avoid floating point drift on the
   * manually entered row.
   */
  assets[anchorSymbol] = {
    ...assets[anchorSymbol],
    rate: editedValue,
    isCustomEdited: true,
    changePct:
        calculatePercentage(
            editedValue,
            anchorMarket.referenceRate *
            scale,
        ),
  };
}

function normalizeEditedRates(
    value:
        | Record<string, number>
        | undefined,
): Record<string, number> {
  if (!value) {
    return {};
  }

  /*
   * Migration from the old implementation:
   * if several overrides were persisted,
   * keep only the first one.
   */
  const first =
      Object.entries(value)[0];

  if (!first) {
    return {};
  }

  return {
    [first[0]]: first[1],
  };
}

export const useMobileStore =
    create<MobileServiceState>(
        (set, get) => ({
          activeTab: 'fx',

          tenor: '1D',

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

          /*
           * Crypto starts with:
           *
           * USD
           * BTC
           */
          watchlistCrypto: [
            ...DEFAULT_CRYPTO,
          ],

          watchlistMetals: [
            ...DEFAULT_METALS,
          ],

          editWatchlistFx: [
            ...DEFAULT_FX,
          ],

          editWatchlistCrypto: [
            ...DEFAULT_CRYPTO,
          ],

          editWatchlistMetals: [
            ...DEFAULT_METALS,
          ],

          assets:
              createAssetMap(),

          editedRates: {},

          marketRates:
              createInitialMarketRates(),

          cryptoCatalog: [
            ...CRYPTO_DEFAULT_CATALOG,
          ],

          setActiveTab: (
              tab,
          ) => {
            set({
              activeTab: tab,
            });

            persistState(
                get(),
            ).catch(
                () => undefined,
            );
          },

          setTenor: (
              tenor,
          ) => {
            set({
              tenor,
            });

            persistState(
                get(),
            ).catch(
                () => undefined,
            );

            void get()
                .forceRefresh();
          },

          setDecimalPlaces: (
              value,
          ) => {
            set({
              decimalPlaces:
              value,
            });

            persistState(
                get(),
            ).catch(
                () => undefined,
            );
          },

          setTheme: (
              value,
          ) => {
            set({
              theme: value,
            });

            persistState(
                get(),
            ).catch(
                () => undefined,
            );
          },

          updateAssetRate: (
              symbol,
              rate,
          ) => {
            if (
                !Number.isFinite(
                    rate,
                ) ||
                rate <= 0
            ) {
              return;
            }

            const state =
                get();

            const asset =
                state.assets[
                    symbol
                    ];

            const market =
                state.marketRates[
                    symbol
                    ];

            if (
                !asset ||
                !market
            ) {
              return;
            }

            /*
             * The new edit completely replaces
             * the previous anchor.
             *
             * USD -> 2
             * then EUR -> 2
             *
             * leaves only EUR as edited.
             */
            const editedRates = {
              [symbol]: rate,
            };

            const assets = {
              ...state.assets,
            };

            const category =
                getCategoryForSymbol(
                    symbol,
                    state,
                );

            if (category) {
              applyAnchor(
                  assets,
                  state.marketRates,
                  editedRates,
                  category,
              );
            }

            set({
              editedRates,
              assets,
            });

            persistState({
              ...get(),
              editedRates,
            }).catch(
                () => undefined,
            );
          },

          clearEditedRate: (
              symbol,
          ) => {
            const state =
                get();

            if (
                !state.editedRates[
                    symbol
                    ]
            ) {
              return;
            }

            const category =
                getCategoryForSymbol(
                    symbol,
                    state,
                );

            const assets = {
              ...state.assets,
            };

            if (category) {
              Object.entries(
                  state.marketRates,
              ).forEach(
                  ([
                     itemSymbol,
                     snapshot,
                   ]) => {
                    const asset =
                        assets[
                            itemSymbol
                            ];

                    if (
                        !asset ||
                        asset.category !==
                        category
                    ) {
                      return;
                    }

                    assets[
                        itemSymbol
                        ] = {
                      ...asset,

                      rate:
                      snapshot.rate,

                      referenceRate:
                      snapshot.referenceRate,

                      changePct:
                          calculatePercentage(
                              snapshot.rate,
                              snapshot.referenceRate,
                          ),

                      isCustomEdited:
                          false,
                    };
                  },
              );
            }

            set({
              editedRates: {},
              assets,
            });

            persistState(
                get(),
            ).catch(
                () => undefined,
            );
          },

          startEditing: () => {
            const state =
                get();

            set({
              isEditMode: true,

              editWatchlistFx: [
                ...state.watchlistFx,
              ],

              editWatchlistCrypto: [
                ...state.watchlistCrypto,
              ],

              editWatchlistMetals: [
                ...state.watchlistMetals,
              ],
            });
          },

          applyEditing: async () => {
            const state =
                get();

            const fx = [
              'USD',
              ...state.editWatchlistFx.filter(
                  (symbol) =>
                      symbol !==
                      'USD',
              ),
            ];

            const crypto = [
              'USD',
              ...state.editWatchlistCrypto.filter(
                  (symbol) =>
                      symbol !==
                      'USD',
              ),
            ];

            const nextState = {
              watchlistFx:
              fx,

              watchlistCrypto:
              crypto,

              watchlistMetals: [
                ...state.editWatchlistMetals,
              ],

              isEditMode:
                  false,
            };

            set(
                nextState,
            );

            await persistState({
              ...get(),
              ...nextState,
            });
          },

          cancelEditing: () => {
            const state =
                get();

            set({
              isEditMode: false,

              editWatchlistFx: [
                ...state.watchlistFx,
              ],

              editWatchlistCrypto: [
                ...state.watchlistCrypto,
              ],

              editWatchlistMetals: [
                ...state.watchlistMetals,
              ],
            });
          },

          reorderWatchlist: (
              category,
              order,
          ) => {
            if (
                category ===
                'fx'
            ) {
              set({
                editWatchlistFx: [
                  'USD',
                  ...order.filter(
                      (symbol) =>
                          symbol !==
                          'USD',
                  ),
                ],
              });

              return;
            }

            if (
                category ===
                'crypto'
            ) {
              set({
                editWatchlistCrypto: [
                  'USD',
                  ...order.filter(
                      (symbol) =>
                          symbol !==
                          'USD',
                  ),
                ],
              });

              return;
            }

            if (
                category ===
                'metals'
            ) {
              set({
                editWatchlistMetals: [
                  ...order,
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
                current.includes(
                    symbol,
                )
            ) {
              return;
            }

            const next = [
              ...current,
              symbol,
            ];

            if (
                category ===
                'fx'
            ) {
              set({
                editWatchlistFx:
                next,
              });
            } else if (
                category ===
                'crypto'
            ) {
              set({
                editWatchlistCrypto:
                    [
                      'USD',
                      ...next.filter(
                          (
                              item,
                          ) =>
                              item !==
                              'USD',
                      ),
                    ],
              });
            } else if (
                category ===
                'metals'
            ) {
              set({
                editWatchlistMetals:
                next,
              });
            }
          },

          removeAssetFromWatchlist: (
              category,
              symbol,
          ) => {
            /*
             * USD cannot be removed from
             * FX or Crypto.
             */
            if (
                (
                    category ===
                    'fx' ||
                    category ===
                    'crypto'
                ) &&
                symbol ===
                'USD'
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
                    (item) =>
                        item !==
                        symbol,
                );

            if (
                category ===
                'fx'
            ) {
              set({
                editWatchlistFx:
                next,
              });
            } else if (
                category ===
                'crypto'
            ) {
              set({
                editWatchlistCrypto:
                    [
                      'USD',
                      ...next.filter(
                          (
                              item,
                          ) =>
                              item !==
                              'USD',
                      ),
                    ],
              });
            } else if (
                category ===
                'metals'
            ) {
              set({
                editWatchlistMetals:
                next,
              });
            }

            /*
             * Removing the active anchor also
             * removes the manual rate override.
             */
            if (
                state.editedRates[
                    symbol
                    ]
            ) {
              const assets = {
                ...state.assets,
              };

              const marketRates =
                  state.marketRates;

              Object.entries(
                  marketRates,
              ).forEach(
                  ([
                     itemSymbol,
                     snapshot,
                   ]) => {
                    const asset =
                        assets[
                            itemSymbol
                            ];

                    if (
                        !asset
                    ) {
                      return;
                    }

                    assets[
                        itemSymbol
                        ] = {
                      ...asset,

                      rate:
                      snapshot.rate,

                      referenceRate:
                      snapshot.referenceRate,

                      changePct:
                          calculatePercentage(
                              snapshot.rate,
                              snapshot.referenceRate,
                          ),

                      isCustomEdited:
                          false,
                    };
                  },
              );

              set({
                editedRates: {},
                assets,
              });
            }
          },

          forceRefresh:
              async () => {
                if (
                    get()
                        .isLoading
                ) {
                  return;
                }

                const state =
                    get();

                set({
                  isLoading:
                      true,
                });

                try {
                  /*
                   * USD is not a CoinGecko coin.
                   * It is the fixed crypto base row.
                   */
                  const cryptoIds =
                      state.watchlistCrypto.filter(
                          (symbol) =>
                              symbol !==
                              'USD',
                      );

                  const [
                    fx,
                    crypto,
                    metals,
                  ] =
                      await Promise.all([
                        fetchFxData(
                            state.tenor,
                        ),

                        fetchCryptoData(
                            state.tenor,
                            cryptoIds,
                        ),

                        fetchMetalsData(
                            state.tenor,
                        ),
                      ]);

                  const current =
                      get();

                  const assets = {
                    ...current.assets,
                  };

                  const marketRates = {
                    ...current.marketRates,
                  };

                  let receivedData =
                      false;

                  /*
                   * Crypto USD base.
                   */
                  marketRates.USD = {
                    rate: 1,
                    referenceRate:
                        1,
                  };

                  assets.USD = {
                    ...assets.USD,
                    rate: 1,
                    referenceRate:
                        1,
                    changePct: 0,
                    category:
                        'crypto',
                  };

                  const merge = (
                      data: Record<
                          string,
                          {
                            rate: number;
                            referenceRate: number;
                            changePct: number;
                          }
                      >,
                  ) => {
                    Object.entries(
                        data,
                    ).forEach(
                        ([
                           symbol,
                           value,
                         ]) => {
                          const existing =
                              assets[
                                  symbol
                                  ];

                          if (
                              !existing
                          ) {
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

                          assets[
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

                          receivedData =
                              true;
                        },
                    );
                  };

                  merge(fx);
                  merge(crypto);
                  merge(metals);

                  /*
                   * Re-apply the single active
                   * anchor using the NEW market
                   * rates.
                   */
                  const editedRates =
                      current.editedRates;

                  const anchorSymbol =
                      Object.keys(
                          editedRates,
                      )[0];

                  if (
                      anchorSymbol
                  ) {
                    const anchorAsset =
                        assets[
                            anchorSymbol
                            ];

                    if (
                        anchorAsset
                    ) {
                      applyAnchor(
                          assets,
                          marketRates,
                          editedRates,
                          anchorAsset.category,
                      );
                    }
                  }

                  set({
                    assets,
                    marketRates,

                    lastSynced:
                        Date.now(),

                    countdown:
                    REFRESH_INTERVAL_SECONDS,

                    isOnline:
                    receivedData,

                    isLoading:
                        false,
                  });
                } catch {
                  set({
                    isLoading:
                        false,

                    isOnline:
                        false,

                    countdown:
                    REFRESH_INTERVAL_SECONDS,
                  });
                }
              },

          tickCountdown: () => {
            const state =
                get();

            if (
                state.countdown <=
                1
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
                  state.countdown -
                  1,
            });
          },

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

                  const state =
                      get();

                  const existingAssets =
                      {
                        ...state.assets,
                      };

                  const converted =
                      catalog.map(
                          (coin) => {
                            const key =
                                coin.id;

                            const existing =
                                existingAssets[
                                    key
                                    ];

                            return {
                              symbol:
                              key,

                              id:
                              key,

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
                                  'crypto' as const,

                              isCustomEdited:
                                  existing?.isCustomEdited ??
                                  false,
                            };
                          },
                      );

                  converted.forEach(
                      (asset) => {
                        existingAssets[
                            asset.symbol
                            ] =
                            asset;
                      },
                  );

                  /*
                   * Keep the fixed USD base.
                   */
                  existingAssets.USD = {
                    symbol:
                        'USD',

                    name:
                        'US Dollar',

                    rate:
                        1,

                    referenceRate:
                        1,

                    changePct:
                        0,

                    category:
                        'crypto',
                  };

                  set({
                    cryptoCatalog:
                    converted,

                    assets:
                    existingAssets,
                  });
                } catch {
                  /*
                   * Keep default catalogue.
                   */
                }
              },

          initialize:
              async () => {
                try {
                  const raw =
                      await AsyncStorage.getItem(
                          STORAGE_KEY,
                      );

                  if (raw) {
                    const saved =
                        JSON.parse(
                            raw,
                        ) as Partial<PersistedSettings>;

                    const fx =
                        saved.watchlistFx?.length
                            ? saved.watchlistFx
                            : DEFAULT_FX;

                    const crypto =
                        saved.watchlistCrypto?.length
                            ? saved.watchlistCrypto
                            : DEFAULT_CRYPTO;

                    const metals =
                        saved.watchlistMetals?.length
                            ? saved.watchlistMetals
                            : DEFAULT_METALS;

                    const editedRates =
                        normalizeEditedRates(
                            saved.editedRates,
                        );

                    set({
                      activeTab:
                          saved.activeTab ??
                          'fx',

                      tenor:
                          saved.tenor ??
                          '1D',

                      decimalPlaces:
                          saved.decimalPlaces ??
                          4,

                      theme:
                          saved.theme ??
                          'system',

                      watchlistFx: [
                        'USD',
                        ...fx.filter(
                            (
                                symbol,
                            ) =>
                                symbol !==
                                'USD',
                        ),
                      ],

                      watchlistCrypto: [
                        'USD',
                        ...crypto.filter(
                            (
                                symbol,
                            ) =>
                                symbol !==
                                'USD',
                        ),
                      ],

                      watchlistMetals:
                      metals,

                      editWatchlistFx: [
                        'USD',
                        ...fx.filter(
                            (
                                symbol,
                            ) =>
                                symbol !==
                                'USD',
                        ),
                      ],

                      editWatchlistCrypto: [
                        'USD',
                        ...crypto.filter(
                            (
                                symbol,
                            ) =>
                                symbol !==
                                'USD',
                        ),
                      ],

                      editWatchlistMetals:
                      metals,

                      editedRates,
                    });
                  }
                } catch {
                  /*
                   * Defaults remain.
                   */
                }

                await get()
                    .loadCryptoCatalog();

                const state =
                    get();

                if (
                    Object.keys(
                        state.editedRates,
                    ).length
                ) {
                  const assets = {
                    ...state.assets,
                  };

                  const anchorSymbol =
                      Object.keys(
                          state.editedRates,
                      )[0];

                  const anchorValue =
                      state.editedRates[
                          anchorSymbol
                          ];

                  const market =
                      state.marketRates[
                          anchorSymbol
                          ];

                  if (
                      market &&
                      anchorValue
                  ) {
                    const category =
                        getCategoryForSymbol(
                            anchorSymbol,
                            state,
                        );

                    if (
                        category
                    ) {
                      applyAnchor(
                          assets,
                          state.marketRates,
                          state.editedRates,
                          category,
                      );
                    }
                  }

                  set({
                    assets,
                  });
                }

                set({
                  isOnline:
                      true,

                  lastSynced:
                      Date.now(),

                  countdown:
                  REFRESH_INTERVAL_SECONDS,
                });

                await get()
                    .forceRefresh();
              },
        }),
    );