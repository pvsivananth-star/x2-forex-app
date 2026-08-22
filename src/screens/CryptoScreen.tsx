import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import { Header } from '../components/Header';
import { fetchCryptoRates, RatesMap } from '../api/ratesApi';

export const CryptoScreen = () => {
    const [cryptoRates, setCryptoRates] = useState<RatesMap>({});

    useEffect(() => {
        fetchCryptoRates().then(setCryptoRates);
    }, []);

    const tokens = [
        { name: 'Bitcoin', symbol: 'BTC' },
        { name: 'Ethereum', symbol: 'ETH' },
        { name: 'Solana', symbol: 'SOL' },
        { name: 'Tether', symbol: 'USDT' },
    ];

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header isOffline={false} />
            <View style={styles.container}>
                <Text style={styles.heading}>Crypto Spot Rates (USD)</Text>
                <FlatList
                    data={tokens}
                    keyExtractor={(item) => item.symbol}
                    renderItem={({ item }) => {
                        const rate = cryptoRates[item.symbol];
                        const priceUsd = rate ? (1 / rate).toFixed(2) : 'Loading...';
                        return (
                            <View style={styles.card}>
                                <Text style={styles.tokenName}>{item.name} ({item.symbol})</Text>
                                <Text style={styles.tokenPrice}>${priceUsd}</Text>
                            </View>
                        );
                    }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#020617' },
    container: { padding: 16, flex: 1 },
    heading: { fontSize: 18, fontWeight: '700', color: '#F8FAFC', marginBottom: 16 },
    card: {
        backgroundColor: '#0F172A',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    tokenName: { fontSize: 16, color: '#94A3B8', fontWeight: '600' },
    tokenPrice: { fontSize: 16, color: '#38BDF8', fontWeight: '700' },
});
