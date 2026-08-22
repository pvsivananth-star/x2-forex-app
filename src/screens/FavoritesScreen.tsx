import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Updated Import
import { Header } from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { fetchAllRates, RatesMap } from '../api/ratesApi';
import { calculateCrossRate } from '../utils/calculator';

interface CurrencyItem {
    code: string;
    name: string;
    flag: string;
    locale: string;
}

const DEFAULT_CURRENCIES: CurrencyItem[] = [
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸', locale: 'en-US' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺', locale: 'de-DE' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧', locale: 'en-GB' },
    { code: 'CAD', name: 'Canadian Dollar', flag: '🇨🇦', locale: 'en-CA' },
    { code: 'AUD', name: 'Australian Dollar', flag: '🇦🇺', locale: 'en-AU' },
    { code: 'INR', name: 'Indian Rupee', flag: '🇮🇳', locale: 'en-IN' },
    { code: 'JPY', name: 'Japanese Yen', flag: '🇯🇵', locale: 'ja-JP' },
    { code: 'XAU', name: 'Gold Ounce', flag: '🥇', locale: 'en-US' },
];

export const FavoritesScreen = () => {
    const { colors, precision } = useTheme();
    const [rates, setRates] = useState<RatesMap>({});
    const [isOffline, setIsOffline] = useState(false);
    const [baseCurrency, setBaseCurrency] = useState<CurrencyItem>(DEFAULT_CURRENCIES[0]);
    const [amountText, setAmountText] = useState('1');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const result = await fetchAllRates();
        setRates(result.rates);
        setIsOffline(result.isOffline);
    };

    const parsedAmount = useMemo(() => {
        const sanitized = amountText.replace(/,/g, '');
        const num = parseFloat(sanitized);
        return isNaN(num) ? 0 : num;
    }, [amountText]);

    const baseRate = rates[baseCurrency.code] || 1;
    const targetCurrencies = useMemo(
        () => DEFAULT_CURRENCIES.filter((item) => item.code !== baseCurrency.code),
        [baseCurrency.code]
    );

    const formatLocaleNumber = (val: number, locale: string, digits: number) => {
        try {
            return new Intl.NumberFormat(locale, {
                minimumFractionDigits: digits,
                maximumFractionDigits: digits,
            }).format(val);
        } catch {
            return val.toFixed(digits);
        }
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <Header isOffline={isOffline} onRefresh={loadData} />

            <View style={styles.headerPadding}>
                <View style={[styles.baseCard, { backgroundColor: colors.card, borderColor: colors.accent }]}>
                    <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Active Base Currency</Text>
                    <View style={styles.baseRow}>
                        <Text style={styles.flagText}>{baseCurrency.flag}</Text>
                        <View style={styles.baseMeta}>
                            <Text style={[styles.currencyCode, { color: colors.textPrimary }]}>{baseCurrency.code}</Text>
                            <Text style={[styles.currencyName, { color: colors.textMuted }]}>{baseCurrency.name}</Text>
                        </View>
                        <TextInput
                            style={[styles.baseInput, { color: colors.accent, borderBottomColor: colors.accent }]}
                            keyboardType="decimal-pad"
                            value={amountText}
                            onChangeText={setAmountText}
                            placeholder="0"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>
                </View>
            </View>

            <FlatList
                data={targetCurrencies}
                keyExtractor={(item) => item.code}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => {
                    const targetRate = rates[item.code] || 1;
                    const { convertedValue, unitLabel } = calculateCrossRate(
                        parsedAmount,
                        baseRate,
                        targetRate,
                        baseCurrency.code,
                        item.code,
                        precision
                    );

                    const formattedValue = formatLocaleNumber(convertedValue, item.locale, precision);

                    return (
                        <TouchableOpacity
                            style={[styles.rowCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                            onPress={() => setBaseCurrency(item)}
                        >
                            <Text style={styles.flagText}>{item.flag}</Text>
                            <View style={styles.rowMeta}>
                                <View style={styles.codeRow}>
                                    <Text style={[styles.rowCode, { color: colors.textPrimary }]}>{item.code}</Text>
                                    <Text style={[styles.rowName, { color: colors.textMuted }]}> - {item.name}</Text>
                                </View>
                                <Text style={[styles.rowEquiv, { color: colors.textSecondary }]}>{unitLabel}</Text>
                            </View>
                            <Text style={[styles.rowValue, { color: colors.accent }]}>{formattedValue}</Text>
                        </TouchableOpacity>
                    );
                }}
                contentContainerStyle={styles.listContent}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1 },
    headerPadding: { paddingHorizontal: 16, paddingTop: 16 },
    listContent: { paddingHorizontal: 16, paddingBottom: 16 },
    sectionLabel: { fontSize: 10, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase' },
    baseCard: {
        padding: 14,
        borderRadius: 10,
        borderWidth: 1.5,
        marginBottom: 8,
    },
    baseRow: { flexDirection: 'row', alignItems: 'center' },
    flagText: { fontSize: 24, marginRight: 10 },
    baseMeta: { flex: 1 },
    currencyCode: { fontSize: 16, fontWeight: '800' },
    currencyName: { fontSize: 11, fontWeight: '500' },
    baseInput: {
        fontSize: 22,
        fontWeight: '800',
        borderBottomWidth: 1.5,
        paddingHorizontal: 6,
        paddingVertical: 2,
        minWidth: 110,
        textAlign: 'right',
    },
    rowCard: {
        padding: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        borderWidth: 1,
    },
    rowMeta: { flex: 1 },
    codeRow: { flexDirection: 'row', alignItems: 'baseline' },
    rowCode: { fontSize: 15, fontWeight: '700' },
    rowName: { fontSize: 11 },
    rowEquiv: { fontSize: 10, marginTop: 2, fontWeight: '500' },
    rowValue: { fontSize: 18, fontWeight: '800' },
});