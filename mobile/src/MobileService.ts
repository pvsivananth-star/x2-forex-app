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
    '@x2_mobile_settings_v3';

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
   * Explicit user overrides.
   *
   * These survive refresh and tenor changes.
   */
  editedRates: Record<string, number>;

  /*
   * Dynamic CoinGecko catalogue.
   */
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
    ...METAL_CATALOG,
  ].forEach((asset) => {
    map[asset.symbol] = {
      ...asset,
    };
  });

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

async function persistState(
    state: MobileServiceState,
) {
  const settings: PersistedSettings = {
    activeTab: state.activeTab,
    tenor: state.tenor,
    decimalPlaces:
    state.decimalPlaces,
    theme: state.theme,

    watchlistFx: state.watchlistFx,
    watchlistCrypto:
    state.watchlistCrypto,
    watchlistMetals:
    state.watchlistMetals,

    editedRates: state.editedRates,
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
          ((rate - reference) /
              reference) *
          100
      ).toFixed(2),
  );
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

          assets: createAssetMap(),

          editedRates: {},

          cryptoCatalog: [
            ...CRYPTO_DEFAULT_CATALOG,
          ],

          setActiveTab: (tab) => {
            set({
              activeTab: tab,
            });

            persistState(
                get(),
            ).catch(() => undefined);
          },

          setTenor: (tenor) => {
            /*
             * Do NOT clear editedRates.
             *
             * This is the core fix for:
             *
             * 1D -> 1W -> 1M
             *
             * edited rates remain exactly as
             * the user entered them.
             */
            set({
              tenor,
            });

            persistState(
                get(),
            ).catch(() => undefined);

            void get().forceRefresh();
          },

          setDecimalPlaces: (value) => {
            set({
              decimalPlaces: value,
            });

            persistState(
                get(),
            ).catch(() => undefined);
          },

          setTheme: (value) => {
            set({
              theme: value,
            });

            persistState(
                get(),
            ).catch(() => undefined);
          },

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

            const state = get();

            const asset =
                state.assets[symbol];

            if (!asset) {
              return;
            }

            const editedRates = {
              ...state.editedRates,
              [symbol]: rate,
            };

            const reference =
                asset.referenceRate ??
                asset.rate;

            const updatedAsset: MarketAsset = {
              ...asset,

              rate,

              isCustomEdited: true,

              changePct:
                  calculatePercentage(
                      rate,
                      reference,
                  ),
            };

            set({
              editedRates,

              assets: {
                ...state.assets,

                [symbol]:
                updatedAsset,
              },
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
            const state = get();

            const editedRates = {
              ...state.editedRates,
            };

            delete editedRates[
                symbol
                ];

            const asset =
                state.assets[symbol];

            if (!asset) {
              set({
                editedRates,
              });

              return;
            }

            set({
              editedRates,

              assets: {
                ...state.assets,

                [symbol]: {
                  ...asset,
                  isCustomEdited:
                      false,
                },
              },
            });

            persistState(
                get(),
            ).catch(() => undefined);
          },

          startEditing: () => {
            const state = get();

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
            const state = get();

            /*
             * USD is permanently first.
             */
            const fx = [
              'USD',
              ...state.editWatchlistFx.filter(
                  (symbol) =>
                      symbol !== 'USD',
              ),
            ];

            const nextState = {
              watchlistFx: fx,

              watchlistCrypto: [
                ...state.editWatchlistCrypto,
              ],

              watchlistMetals: [
                ...state.editWatchlistMetals,
              ],

              isEditMode: false,
            };

            set(nextState);

            await persistState({
              ...get(),
              ...nextState,
            });
          },

          cancelEditing: () => {
            const state = get();

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
            if (category === 'fx') {
              set({
                editWatchlistFx: [
                  'USD',
                  ...order.filter(
                      (symbol) =>
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
                  ...order,
                ],
              });

              return;
            }

            if (
                category === 'metals'
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
            const state = get();

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
                editWatchlistFx: next,
              });
            } else if (
                category === 'crypto'
            ) {
              set({
                editWatchlistCrypto:
                next,
              });
            } else if (
                category === 'metals'
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
             * USD is the base currency and
             * cannot be removed.
             */
            if (
                category === 'fx' &&
                symbol === 'USD'
            ) {
              return;
            }

            const state = get();

            const current =
                getWatchlist(
                    state,
                    category,
                );

            const next =
                current.filter(
                    (item) =>
                        item !== symbol,
                );

            if (category === 'fx') {
              set({
                editWatchlistFx: next,
              });
            } else if (
                category === 'crypto'
            ) {
              set({
                editWatchlistCrypto:
                next,
              });
            } else if (
                category === 'metals'
            ) {
              set({
                editWatchlistMetals:
                next,
              });
            }
          },

          forceRefresh: async () => {
            if (
                get().isLoading
            ) {
              return;
            }

            const state = get();

            set({
              isLoading: true,
            });

            try {
              /*
               * Only fetch crypto rates for
               * the currently selected crypto
               * watchlist.
               */
              const [
                fx,
                crypto,
                metals,
              ] = await Promise.all([
                fetchFxData(
                    state.tenor,
                ),

                fetchCryptoData(
                    state.tenor,
                    state.watchlistCrypto,
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

              let receivedData =
                  false;

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
                    ([symbol, value]) => {
                      const existing =
                          assets[symbol];

                      /*
                       * Dynamic crypto asset may
                       * not yet be in the asset map.
                       */
                      if (!existing) {
                        return;
                      }

                      const customRate =
                          current.editedRates[
                              symbol
                              ];

                      const hasCustomRate =
                          typeof customRate ===
                          'number';

                      const displayedRate =
                          hasCustomRate
                              ? customRate
                              : value.rate;

                      assets[symbol] = {
                        ...existing,

                        rate:
                        displayedRate,

                        referenceRate:
                        value.referenceRate,

                        changePct:
                            calculatePercentage(
                                displayedRate,
                                value.referenceRate,
                            ),

                        isCustomEdited:
                        hasCustomRate,
                      };

                      receivedData = true;
                    },
                );
              };

              merge(fx);
              merge(crypto);
              merge(metals);

              set({
                assets,

                lastSynced:
                    Date.now(),

                countdown:
                REFRESH_INTERVAL_SECONDS,

                isOnline:
                receivedData,

                isLoading: false,
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

          loadCryptoCatalog:
              async () => {
                try {
                  const catalog =
                      await fetchCryptoCatalog();

                  if (!catalog.length) {
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
                              symbol: key,

                              id: key,

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
                            ] = asset;
                      },
                  );

                  set({
                    cryptoCatalog:
                    converted,

                    assets:
                    existingAssets,
                  });
                } catch {
                  // Keep default crypto catalogue.
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
                        saved.editedRates ??
                        {};

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
                            (symbol) =>
                                symbol !==
                                'USD',
                        ),
                      ],

                      watchlistCrypto:
                      crypto,

                      watchlistMetals:
                      metals,

                      editWatchlistFx: [
                        'USD',
                        ...fx.filter(
                            (symbol) =>
                                symbol !==
                                'USD',
                        ),
                      ],

                      editWatchlistCrypto:
                      crypto,

                      editWatchlistMetals:
                      metals,

                      editedRates,
                    });
                  }
                } catch {
                  // Defaults remain.
                }

                /*
                 * Load the complete CoinGecko
                 * catalogue independently from
                 * market-price refresh.
                 */
                await get()
                    .loadCryptoCatalog();

                /*
                 * Re-apply persisted edited rates
                 * to the current asset map.
                 */
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

                  Object.entries(
                      state.editedRates,
                  ).forEach(
                      ([symbol, rate]) => {
                        const asset =
                            assets[symbol];

                        if (!asset) {
                          return;
                        }

                        assets[symbol] = {
                          ...asset,

                          rate,

                          isCustomEdited:
                              true,

                          changePct:
                              calculatePercentage(
                                  rate,
                                  asset.referenceRate ??
                                  rate,
                              ),
                        };
                      },
                  );

                  set({
                    assets,
                  });
                }

                set({
                  isOnline: true,

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