import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Header } from '../components/Header';
import { CurrencyPicker } from '../components/CurrencyPicker';
import { fetchAllRates, RatesMap } from '../api/ratesApi';
import { calculateCrossRate } from '../utils/calculator';
import { LEGAL_DISCLAIMER } from '../constants/disclaimer';

const POPULAR_CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD'];

export const FavoritesScreen = () => {
    const [rates, setRates] = useState<RatesMap>({});
    const [isOffline, setIsOffline] = useState(false);
    const [amount, setAmount] = useState('1');
    const [fromCurr, setFromCurr] = useState('USD');
    const [toCurr, setToCurr] = useState('INR');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const result = await fetchAllRates();
        setRates(result.rates);
        setIsOffline(result.isOffline);
    };

    const parsedAmount = parseFloat(amount) || 0;
    const fromRate = rates[fromCurr] || 1;
    const toRate = rates[toCurr] || 1;

    const { convertedValue, unitLabel } = calculateCrossRate(
        parsedAmount,
        fromRate,
        toRate,
        fromCurr,
        toCurr
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header isOffline={isOffline} />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Currency Selectors */}
                <View style={styles.card}>
                    <CurrencyPicker
                        label="From Currency"
                        selectedCurrency={fromCurr}
                        currencies={POPULAR_CURRENCIES}
                        onSelect={setFromCurr}
                    />
                    <CurrencyPicker
                        label="To Currency"
                        selectedCurrency={toCurr}
                        currencies={POPULAR_CURRENCIES}
                        onSelect={setToCurr}
                    />
                </View>

                {/* Input Card */}
                <View style={styles.card}>
                    <Text style={styles.label}>Amount ({fromCurr})</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={amount}
                        onChangeText={setAmount}
                        placeholderTextColor="#64748B"
                    />
                </View>

                {/* Output Card */}
                <View style={styles.card}>
                    <Text style={styles.label}>Converted Value ({toCurr})</Text>
                    <Text style={styles.resultText}>{convertedValue.toFixed(2)}</Text>
                    <Text style={styles.unitText}>{unitLabel}</Text>
                </View>

                {/* Legal Disclaimer Box */}
                <View style={styles.disclaimerBox}>
                    <Text style={styles.disclaimerTitle}>⚠️ LEGAL NOTICE & DISCLAIMER</Text>
                    <Text style={styles.disclaimerText}>{LEGAL_DISCLAIMER.trim()}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#020617' },
    container: { padding: 16 },
    card: {
        backgroundColor: '#0F172A',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    label: { fontSize: 11, color: '#94A3B8', marginBottom: 8, textTransform: 'uppercase', fontWeight: '600' },
    input: {
        fontSize: 28,
        color: '#F8FAFC',
        fontWeight: '700',
        borderBottomWidth: 1,
        borderBottomColor: '#38BDF8',
        paddingVertical: 4,
    },
    resultText: { fontSize: 32, color: '#38BDF8', fontWeight: '800' },
    unitText: { fontSize: 13, color: '#A855F7', marginTop: 4, fontWeight: '600' },
    disclaimerBox: {
        backgroundColor: '#0F172A',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#334155',
    },
    disclaimerTitle: { fontSize: 11, color: '#F59E0B', fontWeight: '700', marginBottom: 4 },
    disclaimerText: { fontSize: 10, color: '#64748B', lineHeight: 14 },
});