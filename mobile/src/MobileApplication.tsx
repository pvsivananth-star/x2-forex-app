import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

import {
  CRYPTO_CATALOG,
  FX_CATALOG,
  G10_CODES,
  getCatalog,
  MarketAsset,
  METAL_CATALOG,
  REFRESH_INTERVAL_SECONDS,
  TabCategory,
  TENOR_OPTIONS,
  useMobileStore,
  DecimalPlaces,
} from './MobileService';

const TABS: {
  key: TabCategory;
  label: string;
  icon: string;
}[] = [
  { key: 'fx', label: 'Forex', icon: '💱' },
  { key: 'crypto', label: 'Crypto', icon: '₿' },
  { key: 'metals', label: 'Metals', icon: '🪙' },
  { key: 'portfolio', label: 'Portfolio', icon: '📊' },
];

const DARK = {
  background: '#0b0f19',
  surface: '#111827',
  surface2: '#1e293b',
  border: '#263244',
  text: '#f8fafc',
  muted: '#94a3b8',
  dim: '#64748b',
  accent: '#38bdf8',
  accentStrong: '#0284c7',
  green: '#10b981',
  red: '#ef4444',
  yellow: '#f59e0b',
};

const LIGHT = {
  background: '#f8fafc',
  surface: '#ffffff',
  surface2: '#f1f5f9',
  border: '#dbe3ee',
  text: '#0f172a',
  muted: '#475569',
  dim: '#64748b',
  accent: '#0284c7',
  accentStrong: '#0369a1',
  green: '#059669',
  red: '#dc2626',
  yellow: '#d97706',
};

function assetLabel(asset: MarketAsset, category: TabCategory) {
  if (category === 'fx') {
    return asset.symbol;
  }

  return asset.symbol;
}

export const MobileApplication: React.FC = () => {
  const systemTheme = useColorScheme();

  const {
    activeTab,
    tenor,
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
  } = useMobileStore();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [tenorOpen, setTenorOpen] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  const darkMode =
      theme === 'dark' ||
      (theme === 'system' && systemTheme !== 'light');

  const colors = darkMode ? DARK : LIGHT;

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const timer = setInterval(
        () => tickCountdown(),
        1000,
    );

    return () => clearInterval(timer);
  }, [tickCountdown]);

  const currentWatchlist = useMemo(() => {
    if (activeTab === 'fx') {
      return isEditMode ? editWatchlistFx : watchlistFx;
    }

    if (activeTab === 'crypto') {
      return isEditMode
          ? editWatchlistCrypto
          : watchlistCrypto;
    }

    if (activeTab === 'metals') {
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

  const catalog = useMemo(
      () => getCatalog(activeTab),
      [activeTab],
  );

  const filteredCatalog = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return catalog.slice(0, 30);
    }

    return catalog
        .filter(
            (asset) =>
                asset.symbol.toLowerCase().includes(query) ||
                asset.name.toLowerCase().includes(query),
        )
        .slice(0, 30);
  }, [catalog, search]);

  const formatRate = (rate: number) =>
      rate.toFixed(decimalPlaces as DecimalPlaces);

  const handleRateChange = (
      symbol: string,
      value: string,
  ) => {
    setInputValues((previous) => ({
      ...previous,
      [symbol]: value,
    }));

    const parsed = parseFloat(value);

    if (Number.isFinite(parsed) && parsed > 0) {
      updateAssetRate(symbol, parsed);
    }
  };

  const moveRow = (
      index: number,
      direction: -1 | 1,
  ) => {
    const next = [...currentWatchlist];
    const target = index + direction;

    if (target < 0 || target >= next.length) return;

    if (activeTab === 'fx' && next[index] === 'USD') {
      return;
    }

    if (activeTab === 'fx' && next[target] === 'USD') {
      return;
    }

    [next[index], next[target]] = [
      next[target],
      next[index],
    ];

    reorderWatchlist(activeTab, next);
  };

  const openAdd = () => {
    setSearch('');
    setAddOpen(true);
  };

  const addSelected = (symbol: string) => {
    addAssetToWatchlist(activeTab, symbol);
    setSearch('');
    setAddOpen(false);
  };

  const removeSelected = (symbol: string) => {
    if (activeTab === 'fx' && symbol === 'USD') {
      return;
    }

    removeAssetFromWatchlist(activeTab, symbol);
  };

  const themeButton = (
      value: 'system' | 'light' | 'dark',
      label: string,
  ) => (
      <TouchableOpacity
          key={value}
          style={[
            styles.themeButton,
            {
              backgroundColor:
                  theme === value
                      ? colors.accentStrong
                      : colors.surface,
              borderColor:
                  theme === value
                      ? colors.accent
                      : colors.border,
            },
          ]}
          onPress={() => setTheme(value)}
      >
        <Text
            style={[
              styles.themeButtonText,
              {
                color:
                    theme === value
                        ? '#ffffff'
                        : colors.muted,
              },
            ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
  );

  return (
      <SafeAreaView
          style={[
            styles.container,
            { backgroundColor: colors.background },
          ]}
      >
        <StatusBar
            barStyle={
              darkMode
                  ? 'light-content'
                  : 'dark-content'
            }
            backgroundColor={colors.surface}
        />

        {/* HEADER */}
        <View
            style={[
              styles.header,
              {
                backgroundColor: colors.surface,
                borderBottomColor: colors.border,
              },
            ]}
        >
          <View style={styles.headerRow}>
            <TouchableOpacity
                accessibilityLabel="Open settings"
                onPress={() =>
                    setSettingsOpen(true)
                }
                style={styles.headerIconButton}
            >
              <Text
                  style={[
                    styles.headerIcon,
                    { color: colors.text },
                  ]}
              >
                ☰
              </Text>
            </TouchableOpacity>

            <Text
                style={[
                  styles.logo,
                  { color: colors.accent },
                ]}
            >
              X2
            </Text>

            <Text
                style={[
                  styles.headerTitle,
                  { color: colors.text },
                ]}
            >
              {TABS.find(
                  (tab) => tab.key === activeTab,
              )?.label || 'Forex'}
            </Text>

            <View style={styles.headerActions}>
              {!isEditMode && activeTab !== 'portfolio' && (
                  <TouchableOpacity
                      accessibilityLabel="Edit watchlist"
                      onPress={startEditing}
                      style={styles.headerAction}
                  >
                    <Text
                        style={[
                          styles.headerActionText,
                          { color: colors.text },
                        ]}
                    >
                      ✎
                    </Text>
                  </TouchableOpacity>
              )}

              {!isEditMode && activeTab !== 'portfolio' && (
                  <TouchableOpacity
                      accessibilityLabel="Refresh rates"
                      onPress={() => forceRefresh()}
                      style={styles.headerAction}
                  >
                    <Text
                        style={[
                          styles.headerActionText,
                          { color: colors.text },
                        ]}
                    >
                      ↻
                    </Text>
                  </TouchableOpacity>
              )}

              <View
                  style={[
                    styles.liveContainer,
                    { backgroundColor: colors.surface2 },
                  ]}
              >
                <View
                    style={[
                      styles.liveDot,
                      {
                        backgroundColor: isOnline
                            ? colors.green
                            : colors.red,
                      },
                    ]}
                />
                <Text
                    style={[
                      styles.liveText,
                      { color: colors.text },
                    ]}
                >
                  {isLoading
                      ? 'Sync'
                      : isOnline
                          ? 'Live'
                          : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* CATEGORY TABS */}
        {!isEditMode && (
            <View
                style={[
                  styles.categoryBar,
                  {
                    backgroundColor: colors.surface,
                    borderBottomColor: colors.border,
                  },
                ]}
            >
              {TABS.filter(
                  (tab) => tab.key !== 'portfolio',
              ).map((tab) => (
                  <TouchableOpacity
                      key={tab.key}
                      style={[
                        styles.categoryButton,
                        activeTab === tab.key && {
                          backgroundColor:
                          colors.accentStrong,
                        },
                      ]}
                      onPress={() =>
                          setActiveTab(tab.key)
                      }
                  >
                    <Text
                        style={[
                          styles.categoryText,
                          {
                            color:
                                activeTab === tab.key
                                    ? '#ffffff'
                                    : colors.muted,
                          },
                        ]}
                    >
                      {tab.key === 'crypto'
                          ? '₿ Crypto'
                          : tab.key === 'metals'
                              ? '🪙 Metals'
                              : 'Forex'}
                    </Text>
                  </TouchableOpacity>
              ))}
            </View>
        )}

        {/* CONTENT */}
        {activeTab === 'portfolio' ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>
                🚧
              </Text>
              <Text
                  style={[
                    styles.emptyText,
                    { color: colors.muted },
                  ]}
              >
                Portfolio is under construction
              </Text>
            </View>
        ) : (
            <ScrollView
                style={styles.content}
                contentContainerStyle={
                  isEditMode
                      ? styles.editContent
                      : undefined
                }
            >
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
                          styles.tableHeaderText,
                          styles.assetColumn,
                          { color: colors.dim },
                        ]}
                    >
                      Asset
                    </Text>

                    <Text
                        style={[
                          styles.tableHeaderText,
                          styles.rateColumn,
                          { color: colors.dim },
                        ]}
                    >
                      Rate
                    </Text>

                    <TouchableOpacity
                        style={styles.changeColumn}
                        onPress={() =>
                            setTenorOpen(!tenorOpen)
                        }
                    >
                      <Text
                          style={[
                            styles.tableHeaderText,
                            { color: colors.dim },
                          ]}
                      >
                        % {tenor} ▾
                      </Text>
                    </TouchableOpacity>
                  </View>
              )}

              {tenorOpen && !isEditMode && (
                  <View
                      style={[
                        styles.tenorMenu,
                        {
                          backgroundColor:
                          colors.surface2,
                          borderColor: colors.border,
                        },
                      ]}
                  >
                    {TENOR_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                              styles.tenorOption,
                              option === tenor && {
                                backgroundColor:
                                colors.accentStrong,
                              },
                            ]}
                            onPress={() => {
                              setTenor(option);
                              setTenorOpen(false);
                            }}
                        >
                          <Text
                              style={{
                                color:
                                    option === tenor
                                        ? '#ffffff'
                                        : colors.text,
                              }}
                          >
                            {option}
                          </Text>
                        </TouchableOpacity>
                    ))}
                  </View>
              )}

              {isEditMode && (
                  <View
                      style={[
                        styles.editHint,
                        { color: colors.muted },
                      ]}
                  >
                    <Text
                        style={{
                          color: colors.muted,
                          fontSize: 11,
                        }}
                    >
                      Drag with ↑ ↓ to reorder. Remove
                      with −.
                    </Text>
                  </View>
              )}

              {currentWatchlist.map(
                  (symbol, index) => {
                    const asset = assets[symbol];

                    if (!asset) return null;

                    const value =
                        inputValues[symbol] ??
                        formatRate(asset.rate);

                    const isUsd =
                        activeTab === 'fx' &&
                        symbol === 'USD';

                    if (isEditMode) {
                      return (
                          <View
                              key={symbol}
                              style={[
                                styles.editRow,
                                {
                                  backgroundColor:
                                  colors.surface,
                                  borderBottomColor:
                                  colors.border,
                                },
                              ]}
                          >
                            <View
                                style={styles.reorderButtons}
                            >
                              <TouchableOpacity
                                  disabled={
                                      index === 0 ||
                                      isUsd
                                  }
                                  onPress={() =>
                                      moveRow(index, -1)
                                  }
                              >
                                <Text
                                    style={[
                                      styles.arrow,
                                      {
                                        color:
                                            index === 0 ||
                                            isUsd
                                                ? colors.border
                                                : colors.text,
                                      },
                                    ]}
                                >
                                  ↑
                                </Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                  disabled={
                                      index ===
                                      currentWatchlist.length -
                                      1 ||
                                      isUsd
                                  }
                                  onPress={() =>
                                      moveRow(index, 1)
                                  }
                              >
                                <Text
                                    style={[
                                      styles.arrow,
                                      {
                                        color:
                                            index ===
                                            currentWatchlist.length -
                                            1 ||
                                            isUsd
                                                ? colors.border
                                                : colors.text,
                                      },
                                    ]}
                                >
                                  ↓
                                </Text>
                              </TouchableOpacity>
                            </View>

                            <View style={styles.editAsset}>
                              <Text
                                  style={[
                                    styles.assetSymbol,
                                    { color: colors.text },
                                  ]}
                              >
                                {asset.symbol}
                              </Text>
                              <Text
                                  numberOfLines={1}
                                  style={[
                                    styles.assetName,
                                    { color: colors.dim },
                                  ]}
                              >
                                {asset.name}
                              </Text>
                            </View>

                            <TouchableOpacity
                                disabled={isUsd}
                                accessibilityLabel={
                                  isUsd
                                      ? 'USD cannot be removed'
                                      : `Remove ${asset.symbol}`
                                }
                                onPress={() =>
                                    removeSelected(symbol)
                                }
                                style={[
                                  styles.removeButton,
                                  {
                                    opacity: isUsd
                                        ? 0.25
                                        : 1,
                                  },
                                ]}
                            >
                              <Text
                                  style={[
                                    styles.removeText,
                                    { color: colors.red },
                                  ]}
                              >
                                −
                              </Text>
                            </TouchableOpacity>
                          </View>
                      );
                    }

                    return (
                        <View
                            key={symbol}
                            style={[
                              styles.row,
                              {
                                borderBottomColor:
                                colors.border,
                              },
                            ]}
                        >
                          <View
                              style={[
                                styles.assetColumn,
                                styles.assetCell,
                              ]}
                          >
                            <Text
                                style={[
                                  styles.assetSymbol,
                                  { color: colors.text },
                                ]}
                            >
                              {activeTab === 'crypto' &&
                              symbol === 'BTC'
                                  ? '₿ BTC'
                                  : assetLabel(
                                      asset,
                                      activeTab,
                                  )}
                            </Text>

                            <Text
                                numberOfLines={1}
                                style={[
                                  styles.assetName,
                                  { color: colors.dim },
                                ]}
                            >
                              {asset.name}
                            </Text>
                          </View>

                          <View
                              style={[
                                styles.rateColumn,
                                styles.rateCell,
                              ]}
                          >
                            <TextInput
                                keyboardType="numeric"
                                value={value}
                                onChangeText={(text) =>
                                    handleRateChange(
                                        symbol,
                                        text,
                                    )
                                }
                                selectTextOnFocus
                                style={[
                                  styles.rateInput,
                                  {
                                    color: colors.accent,
                                    backgroundColor:
                                    colors.surface,
                                    borderColor:
                                        asset.isCustomEdited
                                            ? colors.yellow
                                            : colors.border,
                                  },
                                ]}
                                accessibilityLabel={`Rate for ${asset.symbol}`}
                            />
                          </View>

                          <View
                              style={[
                                styles.changeColumn,
                                styles.changeCell,
                              ]}
                          >
                            <Text
                                style={[
                                  styles.changeText,
                                  {
                                    color:
                                        asset.changePct >= 0
                                            ? colors.green
                                            : colors.red,
                                  },
                                ]}
                            >
                              {asset.changePct >= 0
                                  ? '+'
                                  : ''}
                              {asset.changePct.toFixed(2)}%
                            </Text>
                          </View>
                        </View>
                    );
                  },
              )}

              {isEditMode && (
                  <TouchableOpacity
                      style={[
                        styles.addButton,
                        {
                          backgroundColor:
                          colors.surface2,
                          borderColor: colors.accent,
                        },
                      ]}
                      onPress={openAdd}
                  >
                    <Text
                        style={[
                          styles.addButtonText,
                          { color: colors.accent },
                        ]}
                    >
                      + Add{' '}
                      {activeTab === 'fx'
                          ? 'Currency'
                          : activeTab === 'crypto'
                              ? 'Crypto'
                              : 'Metal'}
                    </Text>
                  </TouchableOpacity>
              )}
            </ScrollView>
        )}

        {/* EDIT FOOTER */}
        {isEditMode && (
            <View
                style={[
                  styles.editFooter,
                  {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                  },
                ]}
            >
              <TouchableOpacity
                  style={[
                    styles.cancelButton,
                    { borderColor: colors.border },
                  ]}
                  onPress={cancelEditing}
              >
                <Text
                    style={[
                      styles.cancelText,
                      { color: colors.muted },
                    ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                  style={[
                    styles.applyButton,
                    { backgroundColor: colors.accentStrong },
                  ]}
                  onPress={() => applyEditing()}
              >
                <Text style={styles.applyText}>
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
        )}

        {!isEditMode && (
            <View
                style={[
                  styles.footer,
                  {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                  },
                ]}
            >
              <Text
                  style={[
                    styles.footerText,
                    { color: colors.dim },
                  ]}
              >
                {isLoading
                    ? 'Updating rates…'
                    : `Next refresh in ${countdown}s • Last synced ${
                        lastSynced
                            ? new Date(
                                lastSynced,
                            ).toLocaleTimeString()
                            : '—'
                    }`}
              </Text>
            </View>
        )}

        {/* ADD ASSET POPUP */}
        <Modal
            visible={addOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setAddOpen(false)}
        >
          <View style={styles.modalBackdrop}>
            <View
                style={[
                  styles.addModal,
                  {
                    backgroundColor:
                    colors.surface2,
                    borderColor: colors.border,
                  },
                ]}
            >
              <View style={styles.modalHeader}>
                <Text
                    style={[
                      styles.modalTitle,
                      { color: colors.text },
                    ]}
                >
                  Add{' '}
                  {activeTab === 'fx'
                      ? 'Currency'
                      : activeTab === 'crypto'
                          ? 'Crypto'
                          : 'Metal'}
                </Text>

                <TouchableOpacity
                    onPress={() =>
                        setAddOpen(false)
                    }
                >
                  <Text
                      style={[
                        styles.closeText,
                        { color: colors.muted },
                      ]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                  autoFocus
                  value={search}
                  onChangeText={setSearch}
                  placeholder={
                    activeTab === 'fx'
                        ? 'India or INR'
                        : activeTab === 'crypto'
                            ? 'Bitcoin or BTC'
                            : 'Gold or XAU'
                  }
                  placeholderTextColor={colors.dim}
                  style={[
                    styles.searchInput,
                    {
                      color: colors.text,
                      backgroundColor:
                      colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
              />

              <Text
                  style={[
                    styles.matchingLabel,
                    { color: colors.dim },
                  ]}
              >
                Matching
              </Text>

              <ScrollView
                  style={styles.results}
                  keyboardShouldPersistTaps="handled"
              >
                {filteredCatalog.map((asset) => {
                  const alreadyAdded =
                      currentWatchlist.includes(
                          asset.symbol,
                      );

                  return (
                      <TouchableOpacity
                          key={asset.symbol}
                          disabled={alreadyAdded}
                          style={[
                            styles.resultRow,
                            {
                              borderBottomColor:
                              colors.border,
                              opacity: alreadyAdded
                                  ? 0.4
                                  : 1,
                            },
                          ]}
                          onPress={() =>
                              addSelected(
                                  asset.symbol,
                              )
                          }
                      >
                        <View
                            style={
                              styles.resultSymbolContainer
                            }
                        >
                          <Text
                              style={[
                                styles.resultSymbol,
                                { color: colors.text },
                              ]}
                          >
                            {asset.symbol}
                          </Text>

                          <Text
                              style={[
                                styles.resultName,
                                { color: colors.muted },
                              ]}
                          >
                            {asset.name}
                          </Text>
                        </View>

                        {alreadyAdded && (
                            <Text
                                style={{
                                  color: colors.green,
                                  fontSize: 12,
                                }}
                            >
                              Added
                            </Text>
                        )}
                      </TouchableOpacity>
                  );
                })}

                {filteredCatalog.length === 0 && (
                    <Text
                        style={[
                          styles.noResults,
                          { color: colors.muted },
                        ]}
                    >
                      No matching assets
                    </Text>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                    style={[
                      styles.modalCancel,
                      {
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={() =>
                        setAddOpen(false)
                    }
                >
                  <Text
                      style={{
                        color: colors.muted,
                        fontWeight: '700',
                      }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* SETTINGS */}
        <Modal
            visible={settingsOpen}
            transparent
            animationType="slide"
            onRequestClose={() =>
                setSettingsOpen(false)
            }
        >
          <View style={styles.modalBackdrop}>
            <View
                style={[
                  styles.settingsModal,
                  {
                    backgroundColor:
                    colors.surface2,
                    borderColor: colors.border,
                  },
                ]}
            >
              <View style={styles.modalHeader}>
                <Text
                    style={[
                      styles.modalTitle,
                      { color: colors.text },
                    ]}
                >
                  Settings
                </Text>

                <TouchableOpacity
                    onPress={() =>
                        setSettingsOpen(false)
                    }
                >
                  <Text
                      style={[
                        styles.closeText,
                        { color: colors.muted },
                      ]}
                  >
                    ✕
                  </Text>
                </TouchableOpacity>
              </View>

              <Text
                  style={[
                    styles.settingsLabel,
                    { color: colors.muted },
                  ]}
              >
                Theme
              </Text>

              <View style={styles.themeRow}>
                {themeButton(
                    'system',
                    'System',
                )}
                {themeButton(
                    'light',
                    'Light',
                )}
                {themeButton(
                    'dark',
                    'Dark',
                )}
              </View>

              <Text
                  style={[
                    styles.settingsLabel,
                    { color: colors.muted },
                  ]}
              >
                Decimal Places
              </Text>

              <View style={styles.themeRow}>
                {[2, 3, 4].map((dp) => (
                    <TouchableOpacity
                        key={dp}
                        style={[
                          styles.themeButton,
                          {
                            backgroundColor:
                                decimalPlaces === dp
                                    ? colors.accentStrong
                                    : colors.surface,
                            borderColor:
                                decimalPlaces === dp
                                    ? colors.accent
                                    : colors.border,
                          },
                        ]}
                        onPress={() =>
                            setDecimalPlaces(
                                dp as DecimalPlaces,
                            )
                        }
                    >
                      <Text
                          style={{
                            color:
                                decimalPlaces === dp
                                    ? '#ffffff'
                                    : colors.muted,
                            fontWeight: '700',
                          }}
                      >
                        {dp}
                      </Text>
                    </TouchableOpacity>
                ))}
              </View>

              <Text
                  style={[
                    styles.settingsLabel,
                    { color: colors.muted },
                  ]}
              >
                Refresh
              </Text>

              <Text
                  style={[
                    styles.settingsInfo,
                    { color: colors.muted },
                  ]}
              >
                Rates automatically refresh every{' '}
                {REFRESH_INTERVAL_SECONDS / 60} minutes.
              </Text>

              <Text
                  style={[
                    styles.settingsLabel,
                    { color: colors.muted },
                  ]}
              >
                FX
              </Text>

              <Text
                  style={[
                    styles.settingsInfo,
                    { color: colors.muted },
                  ]}
              >
                USD is always the first currency.
                G10 currencies are available in the
                Add Currency search.
              </Text>

              <TouchableOpacity
                  style={[
                    styles.settingsDone,
                    {
                      backgroundColor:
                      colors.accentStrong,
                    },
                  ]}
                  onPress={() =>
                      setSettingsOpen(false)
                  }
              >
                <Text
                    style={styles.settingsDoneText}
                >
                  Done
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    borderBottomWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 34,
  },

  headerIconButton: {
    padding: 4,
    marginRight: 8,
  },

  headerIcon: {
    fontSize: 21,
  },

  logo: {
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: 1,
    marginRight: 18,
  },

  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  headerAction: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },

  headerActionText: {
    fontSize: 21,
  },

  liveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 4,
  },

  liveText: {
    fontSize: 10,
    fontWeight: '800',
  },

  categoryBar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
  },

  categoryButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
    borderRadius: 7,
    marginHorizontal: 2,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: '800',
  },

  content: {
    flex: 1,
    paddingHorizontal: 10,
  },

  editContent: {
    paddingBottom: 15,
  },

  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },

  tableHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  assetColumn: {
    flex: 2,
  },

  rateColumn: {
    flex: 1.5,
  },

  changeColumn: {
    flex: 1,
    alignItems: 'flex-end',
  },

  assetCell: {
    justifyContent: 'center',
  },

  rateCell: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  changeCell: {
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 57,
    borderBottomWidth: 1,
  },

  assetSymbol: {
    fontSize: 14,
    fontWeight: '800',
  },

  assetName: {
    fontSize: 10,
    marginTop: 2,
  },

  rateInput: {
    minWidth: 82,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '700',
  },

  changeText: {
    fontSize: 12,
    fontWeight: '800',
  },

  tenorMenu: {
    position: 'absolute',
    right: 5,
    top: 34,
    zIndex: 20,
    borderWidth: 1,
    borderRadius: 7,
    overflow: 'hidden',
  },

  tenorOption: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },

  editHint: {
    paddingVertical: 8,
  },

  editRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderRadius: 5,
    marginBottom: 2,
  },

  reorderButtons: {
    width: 38,
    alignItems: 'center',
  },

  arrow: {
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 18,
  },

  editAsset: {
    flex: 1,
    paddingHorizontal: 5,
  },

  removeButton: {
    width: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  removeText: {
    fontSize: 27,
    fontWeight: '500',
  },

  addButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
  },

  addButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },

  editFooter: {
    flexDirection: 'row',
    gap: 10,
    padding: 9,
    borderTopWidth: 1,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 7,
    borderWidth: 1,
  },

  cancelText: {
    fontWeight: '800',
  },

  applyButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 7,
  },

  applyText: {
    color: '#ffffff',
    fontWeight: '900',
  },

  footer: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderTopWidth: 1,
  },

  footerText: {
    fontSize: 9,
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  emptyText: {
    fontSize: 14,
    fontWeight: '700',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  addModal: {
    width: '100%',
    maxHeight: '82%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },

  settingsModal: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 18,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
  },

  closeText: {
    fontSize: 18,
  },

  searchInput: {
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 14,
  },

  matchingLabel: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginTop: 15,
    marginBottom: 5,
  },

  results: {
    maxHeight: 340,
  },

  resultRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },

  resultSymbolContainer: {
    flex: 1,
  },

  resultSymbol: {
    fontSize: 14,
    fontWeight: '900',
  },

  resultName: {
    fontSize: 11,
    marginTop: 2,
  },

  noResults: {
    textAlign: 'center',
    paddingVertical: 25,
    fontSize: 13,
  },

  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },

  modalCancel: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 7,
    borderWidth: 1,
  },

  settingsLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 7,
  },

  settingsInfo: {
    fontSize: 12,
    lineHeight: 18,
  },

  themeRow: {
    flexDirection: 'row',
    gap: 7,
  },

  themeButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
  },

  themeButtonText: {
    fontSize: 12,
    fontWeight: '800',
  },

  settingsDone: {
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 7,
    alignItems: 'center',
  },

  settingsDoneText: {
    color: '#ffffff',
    fontWeight: '900',
  },
});

export default MobileApplication;