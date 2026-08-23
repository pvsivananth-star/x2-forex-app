import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { useTheme } from '../context/ThemeContext.tsx';
import { fetchCryptoRates, CryptoItem } from '../api/ratesApi';

export const CryptoScreen = () => {
    const { colors, precision } = useTheme();
    const [cryptoData, setCryptoData] = useState<CryptoItem[]>([]);
    const [isOffline, setIsOffline] = useState(false);

    const loadData = async () => {
        try {
            const res = await fetchCryptoRates();
            setCryptoData(res.data || []);
            setIsOffline(res.isOffline || false);
        } catch {
            setCryptoData([]);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatLocaleNumber = (val: number, digits: number) => {
        try {
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: digits,
                maximumFractionDigits: digits,
            }).format(val);
        } catch {
            return val ? val.toFixed(digits) : '0.00';
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <Header isOffline={isOffline} onRefresh={loadData} />
            <View style={styles.container}>
                <Text style={[styles.subtitle, { color: colors.textMuted }]}>Top 10 Market Cap Cryptocurrencies</Text>
                <FlatList
                    data={cryptoData}
                    keyExtractor={(item: CryptoItem) => item.id}
                    contentContainerStyle={styles.listContent}
                    renderItem={({ item, index }: { item: CryptoItem; index: number }) => {
                        const isPositive = (item.price_change_percentage_24h || 0) >= 0;
                        return (
                            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                                <View style={styles.leftMeta}>
                                    <Text style={[styles.rankText, { color: colors.textMuted }]}>#{index + 1}</Text>
                                    <View>
                                        <Text style={[styles.symbol, { color: colors.textPrimary }]}>
                                            {(item.symbol || '').toUpperCase()}/USD
                                        </Text>
                                        <Text style={[styles.name, { color: colors.textMuted }]}>{item.name}</Text>
                                    </View>
                                </View>
                                <View style={styles.rightMeta}>
                                    <Text style={[styles.price, { color: colors.textPrimary }]}>
                                        ${formatLocaleNumber(item.current_price || 0, precision)}
                                    </Text>
                                    <Text style={[styles.change, { color: isPositive ? colors.green : colors.red }]}>
                                        {isPositive ? '▲ +' : '▼ '}
                                        {(item.price_change_percentage_24h || 0).toFixed(2)}%
                                    </Text>
                                </View>
                            </View>
                        );
                    }}
                />
            </View>
        </SafeAreaView>
    );
};

export default CryptoScreen;

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
    subtitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10 },
    listContent: { paddingBottom: 16 },
    card: {
        padding: 14,
        borderRadius: 10,
        borderWidth: 1,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    rankText: { fontSize: 12, fontWeight: '800', width: 24 },
    symbol: { fontSize: 15, fontWeight: '800' },
    name: { fontSize: 11, fontWeight: '500' },
    rightMeta: { alignItems: 'flex-end' },
    price: { fontSize: 15, fontWeight: '800' },
    change: { fontSize: 11, fontWeight: '700', marginTop: 2 },
});
