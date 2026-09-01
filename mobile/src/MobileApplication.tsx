import React, {useEffect, useMemo, useState,} from 'react';

import {
    SafeAreaView,
    StatusBar,
    Text,
    TouchableOpacity,
    useColorScheme,
    View,
} from 'react-native';

import {REFRESH_INTERVAL_SECONDS, TENOR_OPTIONS, useMobileStore,} from './mobile-store';

import { MarketAsset, TabCategory } from './models';

import {CRYPTO_DEFAULT_CATALOG, FX_CATALOG, METAL_CATALOG, DEFAULT_EQUITY} from './catalogs';

import { EQUITY_ORDER } from './catalogs/equities';
import {DARK_COLORS, LIGHT_COLORS,} from './theme';
import { BottomTabs } from './components/Navigation/BottomTabs';
import {PortfolioTabs} from './components/Portfolio/PortfolioTabs';
import {RefreshTimer,} from './components/RefreshTimer';
import {AssetPickerModal,} from './components/AssetPickerModal';
import {SettingsModal,} from './components/SettingsModal';
import MarketScreen from './screens/MarketScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import { styles } from './screens/styles';

const TAB_TITLES: Record<TabCategory, string> = {
    fx: 'Forex',
    equity: 'Equities',
    crypto: 'Crypto',
    metals: 'Metals',
    portfolio: 'Portfolio',
};

export const MobileApplication: React.FC = () => {
    const systemTheme = useColorScheme();
    const {
        activeTab, tenorFx, tenorCrypto, tenorMetals, decimalPlaces, theme,
        isOnline, isLoading, countdown, isEditMode,
        watchlistFx, watchlistEquity, watchlistCrypto, watchlistMetals,
        editWatchlistFx, editWatchlistEquity, editWatchlistCrypto, editWatchlistMetals,
        assets, cryptoCatalog, setActiveTab, setTenor, setDecimalPlaces, setTheme,
        updateAssetRate, startEditing, applyEditing, cancelEditing,
        reorderWatchlist, addAssetToWatchlist, removeAssetFromWatchlist,
        forceRefresh, tickCountdown, initialize, resetMarketDefaults,
    } = useMobileStore();

    const [settingsOpen, setSettingsOpen] = useState(false);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [tenorOpen, setTenorOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [draftRates, setDraftRates] = useState<Record<string, string>>({});
    const [focusedSymbol, setFocusedSymbol] = useState<string | null>(null);

    const darkMode = theme === 'dark' || (theme === 'system' && systemTheme !== 'light');
    const colors = darkMode ? DARK_COLORS : LIGHT_COLORS;

    useEffect(() => { void initialize(); }, [initialize]);
    useEffect(() => {
        const timer = setInterval(() => tickCountdown(), 1000);
        return () => clearInterval(timer);
    }, [tickCountdown]);

    const currentWatchlist = useMemo(() => {
        if (activeTab === 'fx') return isEditMode ? editWatchlistFx : watchlistFx;
        if (activeTab === 'equity') return isEditMode ? editWatchlistEquity : watchlistEquity;
        if (activeTab === 'crypto') return isEditMode ? editWatchlistCrypto : watchlistCrypto;
        if (activeTab === 'metals') return isEditMode ? editWatchlistMetals : watchlistMetals;
        return [];
    }, [activeTab, isEditMode, editWatchlistFx, editWatchlistEquity, editWatchlistCrypto, editWatchlistMetals, watchlistFx, watchlistEquity, watchlistCrypto, watchlistMetals]);

    const currentCatalog = useMemo<MarketAsset[]>(() => {
        if (activeTab === 'fx') return FX_CATALOG;
        if (activeTab === 'equity') return EQUITY_ORDER.map(item => ({symbol: item.symbol, name: item.name, rate: 0, changePct: 0, category: 'equity'}));
        if (activeTab === 'metals') return METAL_CATALOG;
        if (activeTab === 'crypto') return cryptoCatalog.length ? cryptoCatalog : CRYPTO_DEFAULT_CATALOG;
        return [];
    }, [activeTab, cryptoCatalog]);

    const visibleAssets = useMemo(() => currentWatchlist.map(symbol => assets[symbol]).filter((asset): asset is MarketAsset => Boolean(asset)), [currentWatchlist, assets]);
    const activeTenor = activeTab === 'fx' ? tenorFx : activeTab === 'crypto' ? tenorCrypto : tenorMetals;

    const commitRate = (symbol: string, rawValue: string) => {
        const parsed = Number(rawValue.trim());
        if (!Number.isFinite(parsed) || parsed <= 0) {
            setDraftRates(previous => { const next = {...previous}; delete next[symbol]; return next; });
            return;
        }
        updateAssetRate(symbol, parsed);
        setDraftRates(previous => { const next = {...previous}; delete next[symbol]; return next; });
    };

    const changeDraftRate = (symbol: string, value: string) => setDraftRates(previous => ({...previous, [symbol]: value}));

    const moveRow = (index: number, direction: -1 | 1) => {
        const next = [...currentWatchlist];
        const target = index + direction;
        if (target < 0 || target >= next.length) return;
        if ((activeTab === 'fx' || activeTab === 'crypto' || activeTab === 'metals') && (next[index] === 'USD' || next[target] === 'USD')) return;
        [next[index], next[target]] = [next[target], next[index]];
        reorderWatchlist(activeTab, next);
    };

    const openPicker = () => { setSearch(''); setPickerOpen(true); };
    const addAsset = (symbol: string) => { addAssetToWatchlist(activeTab, symbol); setPickerOpen(false); setSearch(''); };
    const removeAsset = (symbol: string) => removeAssetFromWatchlist(activeTab, symbol);
    const changeTenor = (value: typeof TENOR_OPTIONS[number]) => { setTenor(value); setTenorOpen(false); };
    const filteredPickerCatalog = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return currentCatalog;
        return currentCatalog.filter(asset => asset.name.toLowerCase().includes(query) || (asset.displaySymbol ?? asset.symbol).toLowerCase().includes(query) || asset.symbol.toLowerCase().includes(query));
    }, [currentCatalog, search]);

    return (
        <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.surface} />
            <View style={[styles.header, {backgroundColor: colors.surface, borderBottomColor: colors.border}]}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={() => setSettingsOpen(true)} accessibilityLabel="Open settings" style={styles.menuButton}>
                        <Text style={[styles.menu, {color: colors.text}]}>☰</Text>
                    </TouchableOpacity>
                    <Text style={[styles.logo, {color: colors.accent}]}>X2</Text>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.title, {color: colors.text}]}>{TAB_TITLES[activeTab]}</Text>
                    </View>
                    <View style={styles.headerActions}>
                        {activeTab !== 'portfolio' && activeTab !== 'equity' && !isEditMode && <TouchableOpacity onPress={startEditing} style={styles.headerButton} accessibilityLabel="Edit watchlist"><Text style={[styles.headerButtonText, {color: colors.text}]}>✎</Text></TouchableOpacity>}
                        {activeTab !== 'portfolio' && !isEditMode && <RefreshTimer countdown={countdown} totalSeconds={REFRESH_INTERVAL_SECONDS} color={colors.accent} backgroundColor={colors.border} disabled={isLoading} onPress={() => void forceRefresh()} />}
                        {isEditMode && <Text style={[styles.editingLabel, {color: colors.warning}]}>EDIT</Text>}
                        <View accessible accessibilityLabel={isOnline ? 'Live' : 'Offline'} accessibilityRole="image" style={[styles.connectionIndicator, {backgroundColor: isOnline ? colors.positive : colors.negative}]} />
                    </View>
                </View>
            </View>

            {activeTab === 'portfolio' ? <PortfolioScreen colors={colors} /> : <MarketScreen activeTab={activeTab} isEditMode={isEditMode} visibleAssets={visibleAssets} decimalPlaces={decimalPlaces} colors={colors} draftRates={draftRates} onDraftChange={changeDraftRate} onCommit={commitRate} focusedSymbol={focusedSymbol} setFocusedSymbol={setFocusedSymbol} moveRow={moveRow} removeAsset={removeAsset} openPicker={openPicker} tenorOpen={tenorOpen} setTenorOpen={setTenorOpen} activeTenor={activeTenor} changeTenor={changeTenor} onCancel={cancelEditing} onApply={() => void applyEditing()} />}

            {!isEditMode && activeTab === 'portfolio' && <PortfolioTabs activeCategory="overview" onChange={() => {}} colors={colors} />}
            {!isEditMode && <BottomTabs activeTab={activeTab} colors={colors} onChange={setActiveTab} />}

            <AssetPickerModal visible={pickerOpen} title={`Add ${activeTab === 'fx' ? 'Currency' : activeTab === 'crypto' ? 'Crypto' : 'Metal'}`} placeholder={activeTab === 'crypto' ? 'Search Bitcoin, BTC, Ethereum...' : activeTab === 'fx' ? 'Search INR, India, Euro...' : 'Search Gold, Silver, Platinum...'} assets={filteredPickerCatalog} selected={currentWatchlist} search={search} colors={colors} onSearch={setSearch} onSelect={addAsset} onClose={() => setPickerOpen(false)} />
            <SettingsModal visible={settingsOpen} colors={colors} theme={theme} decimalPlaces={decimalPlaces} onThemeChange={setTheme} onDecimalChange={value => setDecimalPlaces(value)} onResetMarketDefaults={async () => {await resetMarketDefaults(); setDraftRates({}); setSettingsOpen(false);}} onClose={() => setSettingsOpen(false)} />
        </SafeAreaView>
    );
};

export default MobileApplication;
