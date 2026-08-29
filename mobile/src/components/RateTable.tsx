import React, {useEffect, useRef, useState,} from 'react';
import {Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {styles, headerStyles, rowStyles} from './RateTable.styles';
import {MarketAsset, TabCategory, Tenor,} from '../models';

interface RateTableProps {
    colors: any;
    assets: Record<string, MarketAsset>;
    watchlist: string[];
    category: TabCategory;
    tenor: Tenor;
    decimalPlaces: number;
    editingSymbol: string | null;
    inputValues: Record<string, string>;
    onInputChange: (symbol: string, value: string) => void;
    onSubmitRate: (symbol: string) => void;
    onTenorPress: () => void;
}

interface RateInputProps {
    symbol: string;
    value: string;
    externalValue: string;
    colors: any;
    isManual: boolean | undefined;
    active?: boolean;
    onActivate?: () => void;
    onDeactivate?: () => void;
    onInputChange: (symbol: string, value: string) => void;
    onSubmitRate: (symbol: string) => void;
}

const RateInput: React.FC<RateInputProps> = ({symbol, value, externalValue, colors, isManual: _isManual, active = false, onActivate, onDeactivate, onInputChange, onSubmitRate}) => {
    const [draft, setDraft] = useState(value);
    const [focused, setFocused] = useState(false);
    const focusedRef = useRef(false);

    useEffect(() => {
        if (!focusedRef.current) setDraft(externalValue);
    }, [externalValue]);

    useEffect(() => {
        if (!focusedRef.current) setDraft(value);
    }, [value]);

    const commit = () => {
        const committed = draft.replace(/,/g, '').trim();
        const number = Number(committed);
        if (!committed || !Number.isFinite(number) || number <= 0) {
            setDraft(externalValue);
            return;
        }
        onInputChange(symbol, committed);
        onSubmitRate(symbol);
    };

    return (
        <TextInput
            keyboardType="decimal-pad"
            returnKeyType="done"
            selectTextOnFocus
            value={draft}
            onFocus={() => {
                focusedRef.current = true;
                setFocused(true);
                onActivate?.();
                setDraft(draft.replace(/,/g, ''));
            }}
            onChangeText={text => setDraft(text.replace(/,/g, ''))}
            onBlur={() => {
                focusedRef.current = false;
                setFocused(false);
                onDeactivate?.();
            }}
            onSubmitEditing={() => {
                commit();
                focusedRef.current = false;
                setFocused(false);
                onDeactivate?.();
            }}
            style={[
                styles.input,
                {
                    color: colors.accent,
                    backgroundColor: colors.surface,
                    borderColor: active ? '#222' : colors.border,
                    borderWidth: active ? 1.5 : 1,
                    textAlign: 'right' as const,
                },
            ]}
            accessibilityLabel={`Rate for ${symbol}`}
        />
    );
};

export const RateTable: React.FC<RateTableProps> = ({colors, assets, watchlist, category, tenor, decimalPlaces, editingSymbol, inputValues, onInputChange, onSubmitRate, onTenorPress}) => {
    const [focusedSymbol, setFocusedSymbol] = useState<string | null>(null);
    const h = headerStyles(colors);
    const formatRate = (rate: number) => rate.toLocaleString('en-US', {minimumFractionDigits: decimalPlaces, maximumFractionDigits: decimalPlaces});

    return (
        <View>
            <View style={h.header}>
                <Text style={h.assetHeader}>Asset</Text>
                <Text style={h.rateHeader}>Rate</Text>
                <TouchableOpacity style={styles.changeHeader} onPress={onTenorPress}>
                    <Text style={h.headerText(colors)}>% {tenor} ▾</Text>
                </TouchableOpacity>
            </View>

            {watchlist.map(symbol => {
                const asset = assets[symbol];
                if (!asset) return null;

                const externalValue = formatRate(asset.rate);
                const value = inputValues[symbol] ?? externalValue;
                const isManual = editingSymbol === symbol && asset.isCustomEdited;
                const r = rowStyles(colors, focusedSymbol === symbol, asset.changePct >= 0);

                return (
                    <View key={symbol} style={r.row}>
                        <View style={r.asset}>
                            <Text style={r.symbol(colors)}>
                                {category === 'crypto' && symbol === 'BTC' ? '₿ BTC' : symbol}
                            </Text>
                            <Text numberOfLines={1} style={r.name(colors)}>{asset.name}</Text>
                        </View>

                        <View style={r.rate}>
                            <RateInput
                                symbol={symbol}
                                value={value}
                                externalValue={externalValue}
                                colors={colors}
                                isManual={isManual}
                                active={focusedSymbol === symbol}
                                onActivate={() => setFocusedSymbol(symbol)}
                                onDeactivate={() => setFocusedSymbol(null)}
                                onInputChange={onInputChange}
                                onSubmitRate={onSubmitRate}
                            />
                        </View>

                        <View style={r.change}>
                            {!(symbol === 'USD' && (category === 'crypto' || category === 'metals')) ? (
                                <Text style={r.changeText(colors, asset.changePct >= 0)}>
                                    {asset.changePct >= 0 ? '+' : ''}{asset.changePct.toFixed(2)}%
                                </Text>
                            ) : <Text />}
                        </View>
                    </View>
                );
            })}
        </View>
    );
};
