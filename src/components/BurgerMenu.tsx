import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    SafeAreaView,
    ScrollView,
    Alert,
} from 'react-native';
import { useTheme, ThemeMode } from '../context/ThemeContext.tsx';
import { getCachedRates, saveCachedRates } from '../services/storage';
import { LEGAL_DISCLAIMER } from '../constants/disclaimer';

interface BurgerMenuProps {
    visible: boolean;
    onClose: () => void;
    onNavigate: (screenName: string) => void;
}

export const BurgerMenu: React.FC<BurgerMenuProps> = ({ visible, onClose, onNavigate }) => {
    const { colors, mode, setMode, precision, setPrecision } = useTheme();
    const [lastSync, setLastSync] = useState<string>('Never');

    useEffect(() => {
        if (visible) {
            const cached = getCachedRates();
            if (cached && cached.timestamp) {
                setLastSync(new Date(cached.timestamp).toLocaleTimeString());
            }
        }
    }, [visible]);

    const handlePurgeCache = () => {
        saveCachedRates({});
        setLastSync('Cleared');
        Alert.alert('Cache Cleared', 'Offline MMKV storage has been purged.');
    };

    const handleNav = (screen: string) => {
        onNavigate(screen);
        onClose();
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose}>
                <TouchableWithoutFeedback>
                    <View style={[styles.drawer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                        <SafeAreaView style={styles.drawerContent}>
                            <View style={styles.header}>
                                <Text style={[styles.title, { color: colors.accent }]}>X2 Preferences</Text>
                                <TouchableOpacity onPress={onClose}>
                                    <Text style={[styles.closeBtn, { color: colors.textMuted }]}>✕</Text>
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.menuBody}>
                                {/* Markets Section */}
                                <Text style={[styles.sectionHeading, { color: colors.textMuted }]}>MARKETS</Text>
                                <TouchableOpacity style={styles.menuItem} onPress={() => handleNav('Forex')}>
                                    <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>💱 Forex Converter</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={() => handleNav('Crypto')}>
                                    <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>₿ Crypto Spot</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={() => handleNav('Metals')}>
                                    <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>🥇 Precious Metals</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={() => handleNav('Charts')}>
                                    <Text style={[styles.menuLabel, { color: colors.textPrimary }]}>📈 7-Day Charts</Text>
                                </TouchableOpacity>

                                {/* Decimal Precision Configuration */}
                                <Text style={[styles.sectionHeading, { color: colors.textMuted, marginTop: 20 }]}>DECIMAL PRECISION</Text>
                                <View style={styles.themeGroup}>
                                    {[2, 3, 4].map((p) => (
                                        <TouchableOpacity
                                            key={p}
                                            style={[
                                                styles.themeChip,
                                                { backgroundColor: precision === p ? colors.accent : colors.inputBg },
                                            ]}
                                            onPress={() => setPrecision(p)}
                                        >
                                            <Text style={{ color: precision === p ? '#FFF' : colors.textMuted, fontSize: 11, fontWeight: '700' }}>
                                                {p} DECIMALS
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Theme Selector */}
                                <Text style={[styles.sectionHeading, { color: colors.textMuted, marginTop: 20 }]}>THEME MODE</Text>
                                <View style={styles.themeGroup}>
                                    {(['system', 'light', 'dark'] as ThemeMode[]).map((t) => (
                                        <TouchableOpacity
                                            key={t}
                                            style={[
                                                styles.themeChip,
                                                { backgroundColor: mode === t ? colors.accent : colors.inputBg },
                                            ]}
                                            onPress={() => setMode(t)}
                                        >
                                            <Text style={{ color: mode === t ? '#FFF' : colors.textMuted, fontSize: 11, fontWeight: '700' }}>
                                                {t.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Cache Manager */}
                                <Text style={[styles.sectionHeading, { color: colors.textMuted, marginTop: 20 }]}>OFFLINE CACHE</Text>
                                <View style={[styles.cacheCard, { backgroundColor: colors.inputBg }]}>
                                    <Text style={[styles.cacheText, { color: colors.textPrimary }]}>Last Sync: {lastSync}</Text>
                                    <TouchableOpacity style={[styles.purgeBtn, { backgroundColor: colors.red }]} onPress={handlePurgeCache}>
                                        <Text style={styles.purgeText}>Purge Cache</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Legal & Data Sources */}
                                <Text style={[styles.sectionHeading, { color: colors.textMuted, marginTop: 20 }]}>DATA SOURCES & DISCLAIMER</Text>
                                <Text style={[styles.legalText, { color: colors.textMuted }]}>
                                    Rates provided keyless via ECB (Frankfurter) and CoinGecko endpoints.
                                </Text>
                                <Text style={[styles.legalText, { color: colors.textMuted, marginTop: 6 }]}>
                                    {LEGAL_DISCLAIMER.slice(0, 150)}...
                                </Text>
                            </ScrollView>

                            <View style={[styles.footer, { borderTopColor: colors.cardBorder }]}>
                                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                                    X2 Forex & Spot • v1.0.0
                                </Text>
                            </View>
                        </SafeAreaView>
                    </View>
                </TouchableWithoutFeedback>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row' },
    drawer: { width: '80%', height: '100%', borderRightWidth: 1, padding: 16 },
    drawerContent: { flex: 1 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 18, fontWeight: '800' },
    closeBtn: { fontSize: 18, fontWeight: '700' },
    menuBody: { flex: 1 },
    sectionHeading: { fontSize: 10, fontWeight: '800', marginBottom: 8 },
    menuItem: { paddingVertical: 10 },
    menuLabel: { fontSize: 14, fontWeight: '600' },
    themeGroup: { flexDirection: 'row', gap: 8 },
    themeChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    cacheCard: { padding: 12, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cacheText: { fontSize: 12, fontWeight: '600' },
    purgeBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    purgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
    legalText: { fontSize: 10, lineHeight: 14 },
    footer: { paddingTop: 12, borderTopWidth: 1 },
    footerText: { fontSize: 10, textAlign: 'center' },
});