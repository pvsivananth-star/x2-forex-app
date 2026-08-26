import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import {
  useMobileStore,
  TabCategory,
  Tenor,
  TENOR_OPTIONS,
  DecimalPlaces,
  MarketAsset,
} from './MobileService';

const TABS: { key: TabCategory; label: string; icon: string }[] = [
  { key: 'fx', label: 'FX', icon: '💱' },
  { key: 'crypto', label: 'Crypto', icon: '₿' },
  { key: 'metals', label: 'Metals', icon: '🪙' },
  { key: 'portfolio', label: 'Portfolio', icon: '📊' },
];

function fxDisplaySymbol(symbol: string): string {
  return symbol.replace('USD', '');
}

function fxDisplayName(name: string): string {
  return name.replace('US Dollar / ', '').replace(' / US Dollar', '');
}

export const MobileApplication: React.FC = () => {
  const {
    activeTab,
    tenor,
    decimalPlaces,
    isOnline,
    isLoading,
    lastSynced,
    countdown,
    editingSymbol,
    watchlistFx,
    watchlistCrypto,
    watchlistMetals,
    assets,
    setActiveTab,
    setTenor,
    setDecimalPlaces,
    setEditingSymbol,
    updateAssetRate,
    forceRefresh,
    tickCountdown,
    initialize,
  } = useMobileStore();

  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tenorDropdownOpen, setTenorDropdownOpen] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const id = setInterval(() => tickCountdown(), 1000);
    return () => clearInterval(id);
  }, [tickCountdown]);

  const currentWatchlist =
      activeTab === 'fx'
          ? watchlistFx
          : activeTab === 'crypto'
              ? watchlistCrypto
              : activeTab === 'metals'
                  ? watchlistMetals
                  : [];

  const handleRateChange = (symbol: string, val: string) => {
    setInputValues((prev) => ({ ...prev, [symbol]: val }));
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      updateAssetRate(symbol, parsed);
    }
  };

  const handleFocus = (symbol: string) => {
    setEditingSymbol(symbol);
    setInputValues({});
  };

  const handleBlur = () => {
    setEditingSymbol(null);
    setInputValues({});
  };

  const formatRate = (rate: number) => rate.toFixed(decimalPlaces as DecimalPlaces);

  return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />

        {/* Global Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setSettingsOpen(!settingsOpen)} style={styles.menuButton}>
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
            <View style={styles.brandContainer}>
              <Text style={styles.logoText}>X2</Text>
              <Text style={styles.logoSubtitle}>FOREX & MATRIX</Text>
            </View>
            <View style={styles.badgeContainer}>
              <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10b981' : '#ef4444' }]} />
              <Text style={styles.statusText}>{isLoading ? 'Syncing' : isOnline ? 'Live' : 'Offline'}</Text>
            </View>
          </View>

          <View style={styles.refreshRow}>
            <TouchableOpacity style={styles.refreshButton} onPress={() => forceRefresh()}>
              <Text style={styles.refreshText}>↻ Force sync • next in {countdown}s</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings Drawer */}
        {settingsOpen && (
            <View style={styles.drawerOverlay}>
              <TouchableOpacity style={styles.drawerBackdrop} onPress={() => setSettingsOpen(false)} />
              <View style={styles.drawerContent}>
                <Text style={styles.drawerTitle}>Settings</Text>

                <Text style={styles.settingsLabel}>Decimal Places</Text>
                <View style={styles.decimalRow}>
                  {[2, 3, 4].map((dp) => (
                      <TouchableOpacity
                          key={dp}
                          style={[styles.decimalButton, decimalPlaces === dp && styles.decimalButtonActive]}
                          onPress={() => setDecimalPlaces(dp as DecimalPlaces)}
                      >
                        <Text style={[styles.decimalText, decimalPlaces === dp && styles.decimalTextActive]}>{dp}</Text>
                      </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.settingsLabel}>Info</Text>
                <Text style={styles.drawerItem}>• Zero-Backend, Keyless Public Feeds</Text>
                <Text style={styles.drawerItem}>• 1-Hour Auto Sync (manual override available)</Text>
                <Text style={styles.drawerItem}>• Only one rate editable at a time</Text>

                <TouchableOpacity style={styles.drawerClose} onPress={() => setSettingsOpen(false)}>
                  <Text style={styles.drawerCloseText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
        )}

        {/* Content */}
        {activeTab === 'portfolio' ? (
            <View style={styles.underConstruction}>
              <Text style={styles.underConstructionIcon}>🚧</Text>
              <Text style={styles.underConstructionText}>Under construction for this page</Text>
            </View>
        ) : (
            <ScrollView style={styles.content}>
              <View style={styles.tableHeader}>
                <Text style={[styles.th, styles.colAsset]}>Asset</Text>
                <Text style={[styles.th, styles.colRate]}>Rate</Text>
                <TouchableOpacity
                    style={[styles.colChange, styles.changeHeaderButton]}
                    onPress={() => setTenorDropdownOpen(!tenorDropdownOpen)}
                >
                  <Text style={styles.th}>% Chg ({tenor}) ▾</Text>
                </TouchableOpacity>
              </View>

              {tenorDropdownOpen && (
                  <View style={styles.tenorDropdown}>
                    {TENOR_OPTIONS.map((t) => (
                        <TouchableOpacity
                            key={t}
                            style={[styles.tenorOption, tenor === t && styles.tenorOptionActive]}
                            onPress={() => {
                              setTenor(t);
                              setTenorDropdownOpen(false);
                            }}
                        >
                          <Text style={[styles.tenorOptionText, tenor === t && styles.tenorOptionTextActive]}>{t}</Text>
                        </TouchableOpacity>
                    ))}
                  </View>
              )}

              {currentWatchlist.map((symbol) => {
                const asset: MarketAsset | undefined = assets[symbol];
                if (!asset) return null;

                const displayRate =
                    inputValues[symbol] !== undefined ? inputValues[symbol] : formatRate(asset.rate);
                const isLocked = editingSymbol !== null && editingSymbol !== symbol;
                const displaySymbol = activeTab === 'fx' ? fxDisplaySymbol(asset.symbol) : asset.symbol;
                const displayName = activeTab === 'fx' ? fxDisplayName(asset.name) : asset.name;

                return (
                    <View key={symbol} style={styles.row}>
                      <View style={[styles.td, styles.colAsset]}>
                        <Text style={styles.assetSymbol}>{displaySymbol}</Text>
                        <Text style={styles.assetName} numberOfLines={1}>
                          {displayName}
                        </Text>
                      </View>

                      <View style={[styles.td, styles.colRate]}>
                        <TextInput
                            style={[
                              styles.rateInput,
                              asset.isCustomEdited && styles.customEditedInput,
                              isLocked && styles.lockedInput,
                            ]}
                            keyboardType="numeric"
                            value={displayRate}
                            editable={!isLocked}
                            onFocus={() => handleFocus(symbol)}
                            onBlur={handleBlur}
                            onChangeText={(val) => handleRateChange(symbol, val)}
                            placeholderTextColor="#64748b"
                        />
                      </View>

                      <View style={[styles.td, styles.colChange]}>
                        <Text
                            style={[
                              styles.changeText,
                              { color: asset.changePct >= 0 ? '#10b981' : '#ef4444' },
                            ]}
                        >
                          {asset.changePct >= 0 ? '+' : ''}
                          {asset.changePct.toFixed(2)}%
                        </Text>
                      </View>
                    </View>
                );
              })}
            </ScrollView>
        )}

        {/* Footer Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Last Synced: {new Date(lastSynced).toLocaleTimeString()} • Zero-Backend Storage Active
          </Text>
        </View>

        {/* Bottom Tab Bar */}
        <View style={styles.bottomTabBar}>
          {TABS.map((tab) => (
              <TouchableOpacity
                  key={tab.key}
                  style={styles.bottomTabButton}
                  onPress={() => setActiveTab(tab.key)}
              >
                <Text style={styles.bottomTabIcon}>{tab.icon}</Text>
                <Text style={[styles.bottomTabText, activeTab === tab.key && styles.bottomTabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b0f19',
  },
  header: {
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  menuButton: {
    padding: 4,
  },
  menuIcon: {
    color: '#f8fafc',
    fontSize: 20,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  logoText: {
    color: '#38bdf8',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  logoSubtitle: {
    color: '#94a3b8',
    fontSize: 10,
    marginLeft: 6,
    letterSpacing: 0.5,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '600',
  },
  refreshRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  refreshButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  refreshText: {
    color: '#38bdf8',
    fontSize: 11,
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  drawerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  drawerContent: {
    width: '80%',
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  drawerTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingsLabel: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 6,
  },
  decimalRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  decimalButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#0f172a',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  decimalButtonActive: {
    backgroundColor: '#0284c7',
    borderColor: '#0284c7',
  },
  decimalText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  decimalTextActive: {
    color: '#ffffff',
  },
  drawerItem: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 6,
  },
  drawerClose: {
    marginTop: 16,
    backgroundColor: '#0284c7',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  drawerCloseText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  th: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  changeHeaderButton: {
    alignItems: 'flex-end',
  },
  tenorDropdown: {
    position: 'absolute',
    right: 0,
    top: 36,
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    zIndex: 50,
    paddingVertical: 4,
  },
  tenorOption: {
    paddingVertical: 8,
    paddingHorizontal: 18,
  },
  tenorOptionActive: {
    backgroundColor: '#0284c7',
  },
  tenorOptionText: {
    color: '#94a3b8',
    fontSize: 13,
  },
  tenorOptionTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  td: {
    justifyContent: 'center',
  },
  colAsset: {
    flex: 2,
  },
  colRate: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  colChange: {
    flex: 1,
    alignItems: 'flex-end',
  },
  assetSymbol: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  assetName: {
    color: '#64748b',
    fontSize: 11,
  },
  rateInput: {
    backgroundColor: '#111827',
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1f2937',
    minWidth: 80,
  },
  customEditedInput: {
    borderColor: '#f59e0b',
  },
  lockedInput: {
    opacity: 0.4,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  underConstruction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  underConstructionIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  underConstructionText: {
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    padding: 8,
    backgroundColor: '#090d16',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#111827',
  },
  footerText: {
    color: '#64748b',
    fontSize: 10,
  },
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    paddingVertical: 6,
  },
  bottomTabButton: {
    flex: 1,
    alignItems: 'center',
  },
  bottomTabIcon: {
    fontSize: 16,
  },
  bottomTabText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 2,
  },
  bottomTabTextActive: {
    color: '#38bdf8',
  },
});

export default MobileApplication;
