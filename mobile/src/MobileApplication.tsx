import React, {useEffect, useMemo, useState,} from 'react';

import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

import {REFRESH_INTERVAL_SECONDS, TENOR_OPTIONS, useMobileStore,} from './MobileService';

import {MarketAsset, TabCategory,} from './types';

import {CRYPTO_DEFAULT_CATALOG, FX_CATALOG, METAL_CATALOG, DEFAULT_EQUITY} from './catalogs';

import {
    EQUITY_ORDER,
} from './catalogs/equities';

import {DARK_COLORS, LIGHT_COLORS,} from './theme';

import {BottomTabs,} from './components/BottomTabs';

import {RefreshTimer,} from './components/RefreshTimer';

import {MarketRow,} from './components/MarketRow';

import {EditRow,} from './components/EditRow';

import {AssetPickerModal,} from './components/AssetPickerModal';

import {SettingsModal,} from './components/SettingsModal';

const TAB_TITLES: Record<
    TabCategory,
    string
> = {
    fx: 'Forex',
    eq: 'Equities',
    crypto: 'Crypto',
    metals: 'Metals',
    portfolio: 'Portfolio',
};

export const MobileApplication: React.FC =
    () => {
        const systemTheme =
            useColorScheme();

        const {
            activeTab,

            tenorFx,
            tenorCrypto,
            tenorMetals,

            decimalPlaces,
            theme,

            isOnline,
            isLoading,
            lastSynced,
            countdown,

            isEditMode,

            watchlistFx,
            watchlistCrypto,
            watchlistMetals,

            editWatchlistFx,
            editWatchlistCrypto,
            editWatchlistMetals,

            assets,
            cryptoCatalog,

            setActiveTab,
            setTenor,
            setDecimalPlaces,
            setTheme,

            updateAssetRate,

            startEditing,
            applyEditing,
            cancelEditing,

            reorderWatchlist,
            addAssetToWatchlist,
            removeAssetFromWatchlist,

            forceRefresh,
            tickCountdown,
            initialize,

            resetMarketDefaults,
        } =
            useMobileStore();

        const [
            settingsOpen,
            setSettingsOpen,
        ] = useState(false);

        const [
            pickerOpen,
            setPickerOpen,
        ] = useState(false);

        const [
            tenorOpen,
            setTenorOpen,
        ] = useState(false);

        const [
            search,
            setSearch,
        ] = useState('');

        /*
         * Draft values are local to each symbol.
         *
         * This prevents editing one row from
         * changing the other rows.
         */
        const [
            draftRates,
            setDraftRates,
        ] = useState<
            Record<string, string>
        >({});

        const [
            focusedSymbol,
            setFocusedSymbol,
        ] = useState<string | null>(
            null,
        );

        const darkMode =
            theme === 'dark' ||
            (
                theme === 'system' &&
                systemTheme !== 'light'
            );

        const colors =
            darkMode
                ? DARK_COLORS
                : LIGHT_COLORS;

        useEffect(() => {
            void initialize();
        }, [initialize]);

        useEffect(() => {
            const timer =
                setInterval(
                    () =>
                        tickCountdown(),
                    1000,
                );

            return () =>
                clearInterval(timer);
        }, [tickCountdown]);

        const currentWatchlist =
            useMemo(() => {
                if (activeTab === 'fx') {
                    return isEditMode
                        ? editWatchlistFx
                        : watchlistFx;
                }

                if (
                    activeTab === 'equity'
                ) {
                    return isEditMode
                        ? editWatchlistEquity
                        : watchlistEquity;
                }

                if (
                    activeTab === 'crypto'
                ) {
                    return isEditMode
                        ? editWatchlistCrypto
                        : watchlistCrypto;
                }

                if (
                    activeTab === 'metals'
                ) {
                    return isEditMode
                        ? editWatchlistMetals
                        : watchlistMetals;
                }

                return [];
            }, [
                activeTab,
                isEditMode,

                editWatchlistFx,
                editWatchlistCrypto,
                editWatchlistMetals,

                watchlistFx,
                watchlistCrypto,
                watchlistMetals,
            ]);

        const currentCatalog =
            useMemo<MarketAsset[]>(
                () => {
                    if (
                        activeTab === 'fx'
                    ) {
                        return FX_CATALOG;
                    }

                    if (
                        activeTab === 'equity'
                    ) {
                        return DEFAULT_EQUITY;
                    }

                    if (
                        activeTab ===
                        'metals'
                    ) {
                        return METAL_CATALOG;
                    }

                    if (
                        activeTab ===
                        'crypto'
                    ) {
                        return cryptoCatalog.length
                            ? cryptoCatalog
                            : CRYPTO_DEFAULT_CATALOG;
                    }

                    return [];
                },
                [
                    activeTab,
                    cryptoCatalog,
                ],
            );

        const visibleAssets =
            useMemo(() => {
                return currentWatchlist
                    .map(
                        (symbol) =>
                            assets[symbol],
                    )
                    .filter(
                        (
                            asset,
                        ): asset is MarketAsset =>
                            Boolean(asset),
                    );
            }, [
                currentWatchlist,
                assets,
            ]);

        /*
         * Each market keeps its own
         * percentage-change tenor.
         *
         * FX     -> tenorFx
         * Crypto -> tenorCrypto
         * Metals -> tenorMetals
         */
        const activeTenor =
            activeTab === 'fx'
                ? tenorFx
                : activeTab === 'crypto'
                    ? tenorCrypto
                    : tenorMetals;

        const commitRate = (
            symbol: string,
            rawValue: string,
        ) => {
            const parsed =
                Number(
                    rawValue.trim(),
                );

            if (
                !Number.isFinite(parsed) ||
                parsed <= 0
            ) {
                setDraftRates(
                    (previous) => {
                        const next = {
                            ...previous,
                        };

                        delete next[
                            symbol
                            ];

                        return next;
                    },
                );

                return;
            }

            /*
             * Only this symbol is updated.
             */
            updateAssetRate(
                symbol,
                parsed,
            );

            setDraftRates(
                (previous) => {
                    const next = {
                        ...previous,
                    };

                    delete next[
                        symbol
                        ];

                    return next;
                },
            );
        };

        const changeDraftRate = (
            symbol: string,
            value: string,
        ) => {
            setDraftRates(
                (previous) => ({
                    ...previous,
                    [symbol]: value,
                }),
            );
        };

        const moveRow = (
            index: number,
            direction: -1 | 1,
        ) => {
            const next = [
                ...currentWatchlist,
            ];

            const target =
                index + direction;

            if (
                target < 0 ||
                target >= next.length
            ) {
                return;
            }

            /*
             * USD cannot be moved.
             */
            if (
                (
                    activeTab === 'fx' ||
                    activeTab === 'crypto' ||
                    activeTab === 'metals'
                ) &&
                (
                    next[index] === 'USD' ||
                    next[target] === 'USD'
                )
            ) {
                return;
            }

            [
                next[index],
                next[target],
            ] = [
                next[target],
                next[index],
            ];

            reorderWatchlist(
                activeTab,
                next,
            );
        };

        const openPicker = () => {
            setSearch('');
            setPickerOpen(true);
        };

        const addAsset = (
            symbol: string,
        ) => {
            addAssetToWatchlist(
                activeTab,
                symbol,
            );

            setPickerOpen(false);
            setSearch('');
        };

        const removeAsset = (
            symbol: string,
        ) => {
            removeAssetFromWatchlist(
                activeTab,
                symbol,
            );
        };

        const changeTenor = (
            value: typeof TENOR_OPTIONS[number],
        ) => {
            setTenor(value);
            setTenorOpen(false);
        };

        const filteredPickerCatalog =
            useMemo(() => {
                const query =
                    search
                        .trim()
                        .toLowerCase();

                if (!query) {
                    return currentCatalog;
                }

                return currentCatalog.filter(
                    (asset) =>
                        asset.name
                            .toLowerCase()
                            .includes(query) ||
                        (
                            asset.displaySymbol ??
                            asset.symbol
                        )
                            .toLowerCase()
                            .includes(query) ||
                        asset.symbol
                            .toLowerCase()
                            .includes(query),
                );
            }, [
                currentCatalog,
                search,
            ]);

        return (
            <SafeAreaView
                style={[
                    styles.container,
                    {
                        backgroundColor:
                        colors.background,
                    },
                ]}
            >
                <StatusBar
                    barStyle={
                        darkMode
                            ? 'light-content'
                            : 'dark-content'
                    }
                    backgroundColor={
                        colors.surface
                    }
                />

                {/* ---------------------------------------------------------------- */}
                {/* HEADER                                                           */}
                {/* ---------------------------------------------------------------- */}

                <View
                    style={[
                        styles.header,
                        {
                            backgroundColor:
                            colors.surface,
                            borderBottomColor:
                            colors.border,
                        },
                    ]}
                >
                    <View
                        style={styles.headerRow}
                    >
                        <TouchableOpacity
                            onPress={() =>
                                setSettingsOpen(
                                    true,
                                )
                            }
                            accessibilityLabel="Open settings"
                            style={
                                styles.menuButton
                            }
                        >
                            <Text
                                style={[
                                    styles.menu,
                                    {
                                        color:
                                        colors.text,
                                    },
                                ]}
                            >
                                ☰
                            </Text>
                        </TouchableOpacity>

                        <Text
                            style={[
                                styles.logo,
                                {
                                    color:
                                    colors.accent,
                                },
                            ]}
                        >
                            X2
                        </Text>

                        <View
                            style={
                                styles.titleContainer
                            }
                        >
                            <Text
                                style={[
                                    styles.title,
                                    {
                                        color:
                                        colors.text,
                                    },
                                ]}
                            >
                                {
                                    TAB_TITLES[
                                        activeTab
                                        ]
                                }
                            </Text>
                        </View>

                        <View
                            style={
                                styles.headerActions
                            }
                        >
                            {activeTab !==
                                'portfolio' &&
                                !isEditMode && (
                                    <>
                                        <TouchableOpacity
                                            onPress={
                                                startEditing
                                            }
                                            style={
                                                styles.headerButton
                                            }
                                            accessibilityLabel="Edit watchlist"
                                        >
                                            <Text
                                                style={[
                                                    styles.headerButtonText,
                                                    {
                                                        color:
                                                        colors.text,
                                                    },
                                                ]}
                                            >
                                                ✎
                                            </Text>
                                        </TouchableOpacity>

                                        <RefreshTimer
                                            countdown={
                                                countdown
                                            }
                                            totalSeconds={
                                                REFRESH_INTERVAL_SECONDS
                                            }
                                            color={
                                                colors.accent
                                            }
                                            backgroundColor={
                                                colors.border
                                            }
                                            disabled={
                                                isLoading
                                            }
                                            onPress={() =>
                                                void forceRefresh()
                                            }
                                        />
                                    </>
                                )}

                            {isEditMode && (
                                <Text
                                    style={[
                                        styles.editingLabel,
                                        {
                                            color:
                                            colors.warning,
                                        },
                                    ]}
                                >
                                    EDIT
                                </Text>
                            )}

                            <View
                                accessible={true}
                                accessibilityLabel={
                                    isOnline
                                        ? 'Live'
                                        : 'Offline'
                                }
                                accessibilityHint={
                                    isOnline
                                        ? 'Market data is connected'
                                        : 'Market data is offline'
                                }
                                accessibilityRole="image"
                                style={[
                                    styles.connectionIndicator,
                                    {
                                        backgroundColor:
                                            isOnline
                                                ? colors.positive
                                                : colors.negative,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                </View>

                {/* ---------------------------------------------------------------- */}
                {/* CONTENT                                                          */}
                {/* ---------------------------------------------------------------- */}

                {activeTab ===
                'portfolio' ? (
                    <View
                        style={
                            styles.portfolio
                        }
                    >
                        <Text
                            style={
                                styles.portfolioIcon
                            }
                        >
                            ▦
                        </Text>

                        <Text
                            style={[
                                styles.portfolioTitle,
                                {
                                    color:
                                    colors.text,
                                },
                            ]}
                        >
                            Portfolio
                        </Text>

                        <Text
                            style={[
                                styles.portfolioText,
                                {
                                    color:
                                    colors.muted,
                                },
                            ]}
                        >
                            Under Construction
                        </Text>
                    </View>
                ) : (
                    <>
                        {!isEditMode && (
                            <View
                                style={[
                                    styles.tableHeader,
                                    {
                                        borderBottomColor:
                                        colors.border,
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.headerCell,
                                        styles.assetHeader,
                                        {
                                            color:
                                            colors.dim,
                                        },
                                    ]}
                                >
                                    Asset
                                </Text>

                                <Text
                                    style={[
                                        styles.headerCell,
                                        styles.rateHeader,
                                        {
                                            color:
                                            colors.dim,
                                        },
                                    ]}
                                >
                                    Rate
                                </Text>

                                <TouchableOpacity
                                    onPress={() =>
                                        setTenorOpen(
                                            (open) =>
                                                !open,
                                        )
                                    }
                                    style={[
                                        styles.tenorHeader,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.headerCell,
                                            {
                                                color:
                                                colors.dim,
                                            },
                                        ]}
                                    >
                                        % {activeTenor}{' '}
                                        ▾
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {tenorOpen &&
                            !isEditMode && (
                                <View
                                    style={[
                                        styles.tenorMenu,
                                        {
                                            backgroundColor:
                                            colors.surfaceElevated,
                                            borderColor:
                                            colors.border,
                                        },
                                    ]}
                                >
                                    {TENOR_OPTIONS.map(
                                        (option) => (
                                            <TouchableOpacity
                                                key={
                                                    option
                                                }
                                                onPress={() =>
                                                    changeTenor(
                                                        option,
                                                    )
                                                }
                                                style={[
                                                    styles.tenorOption,
                                                    option ===
                                                    activeTenor && {
                                                        backgroundColor:
                                                        colors.accentStrong,
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={{
                                                        color:
                                                            option ===
                                                            activeTenor
                                                                ? '#FFFFFF'
                                                                : colors.text,
                                                        fontWeight:
                                                            '800',
                                                    }}
                                                >
                                                    {option}
                                                </Text>
                                            </TouchableOpacity>
                                        ),
                                    )}
                                </View>
                            )}

                        <ScrollView
                            style={
                                styles.content
                            }
                            contentContainerStyle={
                                isEditMode
                                    ? styles.editContent
                                    : styles.marketContent
                            }
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={true}
                            persistentScrollbar={true}
                        >
                            {isEditMode && (
                                <View
                                    style={[
                                        styles.editInfo,
                                        {
                                            backgroundColor:
                                            colors.surfaceElevated,
                                            borderColor:
                                            colors.border,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.editInfoText,
                                            {
                                                color:
                                                colors.muted,
                                            },
                                        ]}
                                    >
                                        Add, remove or
                                        move assets.
                                        Changes apply
                                        only to this
                                        market.
                                    </Text>
                                </View>
                            )}

                            {visibleAssets.map(
                                (
                                    asset,
                                    index,
                                ) =>
                                    isEditMode ? (
                                        <EditRow
                                            key={
                                                asset.symbol
                                            }
                                            asset={
                                                asset
                                            }
                                            index={
                                                index
                                            }
                                            count={
                                                visibleAssets.length
                                            }
                                            locked={
                                                (
                                                    activeTab === 'fx' ||
                                                    activeTab === 'crypto' ||
                                                    activeTab === 'metals'
                                                ) &&
                                                asset.symbol ===
                                                'USD'
                                            }
                                            colors={
                                                colors
                                            }
                                            onMove={
                                                moveRow
                                            }
                                            onRemove={
                                                removeAsset
                                            }
                                        />
                                    ) : (
                                        <MarketRow
                                            key={
                                                asset.symbol
                                            }
                                            asset={
                                                asset
                                            }
                                            decimalPlaces={
                                                decimalPlaces
                                            }
                                            colors={
                                                colors
                                            }
                                            draftValue={
                                                draftRates[
                                                    asset.symbol
                                                    ]
                                            }
                                            onDraftChange={
                                                changeDraftRate
                                            }
                                            onCommit={
                                                commitRate
                                            }
                                            active={
                                                asset.symbol ===
                                                focusedSymbol
                                            }
                                            onActivate={() =>
                                                setFocusedSymbol(
                                                    asset.symbol,
                                                )
                                            }
                                            onDeactivate={() =>
                                                setFocusedSymbol(
                                                    null,
                                                )
                                            }
                                        />
                                    ),
                            )}

                            {isEditMode && (
                                <TouchableOpacity
                                    onPress={
                                        openPicker
                                    }
                                    style={[
                                        styles.addButton,
                                        {
                                            borderColor:
                                            colors.accent,
                                            backgroundColor:
                                            colors.surfaceElevated,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.addText,
                                            {
                                                color:
                                                colors.accent,
                                            },
                                        ]}
                                    >
                                        + Add{' '}
                                        {activeTab ===
                                        'fx'
                                            ? 'Currency'
                                            : activeTab ===
                                            'crypto'
                                                ? 'Crypto'
                                                : 'Metal'}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            {!isEditMode &&
                                visibleAssets.length ===
                                0 && (
                                    <View
                                        style={
                                            styles.empty
                                        }
                                    >
                                        <Text
                                            style={[
                                                styles.emptyText,
                                                {
                                                    color:
                                                    colors.muted,
                                                },
                                            ]}
                                        >
                                            No assets selected
                                        </Text>
                                    </View>
                                )}
                        </ScrollView>

                        {isEditMode && (
                            <View
                                style={[
                                    styles.editFooter,
                                    {
                                        backgroundColor:
                                        colors.surface,
                                        borderTopColor:
                                        colors.border,
                                    },
                                ]}
                            >
                                <TouchableOpacity
                                    onPress={
                                        cancelEditing
                                    }
                                    style={[
                                        styles.footerButton,
                                        {
                                            borderColor:
                                            colors.border,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color:
                                            colors.muted,
                                            fontWeight:
                                                '900',
                                        }}
                                    >
                                        Cancel
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() =>
                                        void applyEditing()
                                    }
                                    style={[
                                        styles.footerButton,
                                        {
                                            backgroundColor:
                                            colors.accentStrong,
                                            borderColor:
                                            colors.accentStrong,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={{
                                            color:
                                                '#FFFFFF',
                                            fontWeight:
                                                '900',
                                        }}
                                    >
                                        Apply
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}

                {/* ---------------------------------------------------------------- */}
                {/* BOTTOM TABS                                                     */}
                {/* ---------------------------------------------------------------- */}

                {!isEditMode && (
                    <BottomTabs
                        activeTab={
                            activeTab
                        }
                        colors={
                            colors
                        }
                        onChange={
                            setActiveTab
                        }
                    />
                )}

                <AssetPickerModal
                    visible={
                        pickerOpen
                    }
                    title={`Add ${
                        activeTab ===
                        'fx'
                            ? 'Currency'
                            : activeTab ===
                            'crypto'
                                ? 'Crypto'
                                : 'Metal'
                    }`}
                    placeholder={
                        activeTab ===
                        'crypto'
                            ? 'Search Bitcoin, BTC, Ethereum...'
                            : activeTab ===
                            'fx'
                                ? 'Search INR, India, Euro...'
                                : 'Search Gold, Silver, Platinum...'
                    }
                    assets={
                        filteredPickerCatalog
                    }
                    selected={
                        currentWatchlist
                    }
                    search={
                        search
                    }
                    colors={
                        colors
                    }
                    onSearch={
                        setSearch
                    }
                    onSelect={
                        addAsset
                    }
                    onClose={() =>
                        setPickerOpen(
                            false,
                        )
                    }
                />

                <SettingsModal
                    visible={
                        settingsOpen
                    }
                    colors={
                        colors
                    }
                    theme={
                        theme
                    }
                    decimalPlaces={
                        decimalPlaces
                    }
                    onThemeChange={
                        setTheme
                    }
                    onDecimalChange={(
                        value,
                    ) =>
                        setDecimalPlaces(
                            value,
                        )
                    }
                    onResetMarketDefaults={async () => {
                        await resetMarketDefaults();

                        setDraftRates({});

                        // Close the settings modal after resetting defaults
                        setSettingsOpen(false);
                    }}
                    onClose={() =>
                        setSettingsOpen(
                            false,
                        )
                    }
                />
            </SafeAreaView>
        );
    };

const styles =
    StyleSheet.create({
        container: {
            flex: 1,
        },

        header: {
            paddingHorizontal: 10,
            paddingVertical: 9,
            borderBottomWidth: 1,
        },

        headerRow: {
            minHeight: 38,
            flexDirection: 'row',
            alignItems: 'center',
        },

        menuButton: {
            width: 34,
            height: 34,
            alignItems: 'center',
            justifyContent:
                'center',
        },

        menu: {
            fontSize: 21,
            fontWeight: '700',
        },

        logo: {
            fontSize: 21,
            fontWeight: '950',
            letterSpacing: 1,
            marginHorizontal: 8,
        },

        titleContainer: {
            flex: 1,
            justifyContent:
                'center',
        },

        title: {
            fontSize: 16,
            fontWeight: '900',
        },

        status: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 2,
        },

        statusDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
            marginRight: 4,
        },

        statusText: {
            fontSize: 9,
            fontWeight: '800',
        },

        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
        },

        headerButton: {
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent:
                'center',
        },

        headerButtonText: {
            fontSize: 20,
            fontWeight: '800',
        },

        editingLabel: {
            fontSize: 10,
            fontWeight: '900',
            letterSpacing: 1,
            marginRight: 5,
        },

        tableHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            minHeight: 34,
            paddingHorizontal: 10,
            borderBottomWidth: 1,
        },

        headerCell: {
            fontSize: 10,
            fontWeight: '900',
            textTransform:
                'uppercase',
        },

        assetHeader: {
            flex: 2,
        },

        rateHeader: {
            flex: 1.55,
            textAlign: 'right',
        },

        tenorHeader: {
            flex: 0.95,
            alignItems: 'flex-end',
        },

        tenorMenu: {
            position: 'absolute',
            right: 10,
            top: 83,
            zIndex: 100,
            borderWidth: 1,
            borderRadius: 9,
            overflow: 'hidden',
            elevation: 8,
        },

        tenorOption: {
            paddingHorizontal: 20,
            paddingVertical: 10,
        },

        content: {
            flex: 1,
            paddingHorizontal: 10,
        },

        marketContent: {
            paddingBottom: 10,
        },

        editContent: {
            paddingBottom: 15,
        },

        editInfo: {
            borderWidth: 1,
            borderRadius: 9,
            paddingHorizontal: 11,
            paddingVertical: 9,
            marginVertical: 8,
        },

        editInfoText: {
            fontSize: 11,
            lineHeight: 16,
        },

        addButton: {
            marginTop: 12,
            minHeight: 45,
            borderWidth: 1,
            borderRadius: 9,
            alignItems: 'center',
            justifyContent:
                'center',
        },

        addText: {
            fontSize: 13,
            fontWeight: '900',
        },

        editFooter: {
            flexDirection: 'row',
            gap: 9,
            paddingHorizontal: 10,
            paddingVertical: 8,
            borderTopWidth: 1,
        },

        footerButton: {
            flex: 1,
            minHeight: 42,
            alignItems: 'center',
            justifyContent:
                'center',
            borderRadius: 8,
            borderWidth: 1,
        },

        portfolio: {
            flex: 1,
            alignItems: 'center',
            justifyContent:
                'center',
        },

        portfolioIcon: {
            fontSize: 44,
            marginBottom: 10,
        },

        portfolioTitle: {
            fontSize: 20,
            fontWeight: '900',
        },

        portfolioText: {
            marginTop: 5,
            fontSize: 13,
            fontWeight: '700',
        },

        empty: {
            alignItems: 'center',
            paddingVertical: 40,
        },

        emptyText: {
            fontSize: 13,
            fontWeight: '700',
        },
    });

export default MobileApplication;
