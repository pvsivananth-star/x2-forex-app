import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { fetchCryptoRates } from '../api/ratesApi';

export const CryptoScreen = () => {
    const { colors, precision } = useTheme();
    const [cryptoData, setCryptoData] = useState<any[]>([]);
    const [isOffline, setIsOffline] = useState(false);

    const loadData = async () => {
        const res = await fetchCryptoRates();
        setCryptoData(res.data);
        setIsOffline(res.isOffline);
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <Header isOffline={isOffline} onRefresh={loadData} />
            <View style={styles.container}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Crypto Spot Markets</Text>
                <FlatList
                    data={cryptoData}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                            <View>
                                <Text style={[styles.symbol, { color: colors.textPrimary }]}>{item.symbol.toUpperCase()}/USD</Text>
                                <Text style={[styles.name, { color: colors.textMuted }]}>{item.name}</Text>
                            </View>
                            <Text style={[styles.price, { color: colors.accent }]}>
                                ${item.current_price?.toFixed(precision)}
                            </Text>
                        </View>
                    )}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    container: { flex: 1, padding: 16 },
    title: { fontSize: 18, fontWeight: '800', marginBottom: 12 },
    card: { padding: 14, borderRadius: 10, borderWidth: 1, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    symbol: { fontSize: 15, fontWeight: '700' },
    name: { fontSize: 11 },
    price: { fontSize: 16, fontWeight: '800' },
});