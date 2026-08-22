import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { Header } from '../components/Header';
import { fetchCryptoRates } from '../api/ratesApi';

export const MetalsScreen = () => {
    const [goldPrice, setGoldPrice] = useState<string>('Loading...');

    useEffect(() => {
        fetchCryptoRates().then((rates) => {
            if (rates.XAU) {
                setGoldPrice((1 / rates.XAU).toFixed(2));
            }
        });
    }, []);

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header isOffline={false} />
            <View style={styles.container}>
                <Text style={styles.heading}>Precious Metals Spot Rates</Text>
                <View style={styles.card}>
                    <Text style={styles.metalName}>Gold (XAU / Oz)</Text>
                    <Text style={styles.metalPrice}>${goldPrice}</Text>
                </View>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    metalName: { fontSize: 16, color: '#F59E0B', fontWeight: '600' },
    metalPrice: { fontSize: 16, color: '#38BDF8', fontWeight: '700' },
});
