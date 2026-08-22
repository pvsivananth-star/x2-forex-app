import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface CurrencyPickerProps {
    label: string;
    selectedCurrency: string;
    currencies: string[];
    onSelect: (currency: string) => void;
}

export const CurrencyPicker: React.FC<CurrencyPickerProps> = ({
                                                                  label,
                                                                  selectedCurrency,
                                                                  currencies,
                                                                  onSelect,
                                                              }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.buttonRow}>
                {currencies.map((curr) => {
                    const isSelected = curr === selectedCurrency;
                    return (
                        <TouchableOpacity
                            key={curr}
                            style={[styles.chip, isSelected && styles.chipActive]}
                            onPress={() => onSelect(curr)}
                        >
                            <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                                {curr}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 12 },
    label: { fontSize: 11, color: '#94A3B8', marginBottom: 6, textTransform: 'uppercase', fontWeight: '600' },
    buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
    chip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
    },
    chipActive: { backgroundColor: '#38BDF8', borderColor: '#38BDF8' },
    chipText: { fontSize: 12, color: '#94A3B8', fontWeight: '700' },
    chipTextActive: { color: '#020617' },
});