import React, {useEffect, useState} from 'react';
import {Text, TextInput, View} from 'react-native';
import {makeRowStyles} from './MarketRow.styles';
import {MarketAsset} from '../models';
import {CRYPTO_DEFAULT_CATALOG} from '../catalogs';
import {AppColors} from '../theme';

interface MarketRowProps {
    asset: MarketAsset;
    decimalPlaces: number;
    colors: AppColors;
    draftValue?: string;
    onDraftChange?: (symbol: string, value: string) => void;
    onCommit: (symbol: string, value: string) => void;
    active?: boolean;
    onActivate?: () => void;
    onDeactivate?: () => void;
}

export const MarketRow: React.FC<MarketRowProps> = ({
    asset, decimalPlaces, colors, draftValue, onDraftChange, onCommit,
    active = false, onActivate, onDeactivate,
}) => {
    const catalogAsset = asset.category === 'crypto'
        ? CRYPTO_DEFAULT_CATALOG.find(item => item.id === asset.symbol)
        : undefined;
    const displaySymbol = catalogAsset?.displaySymbol ?? asset.displaySymbol ?? asset.symbol;
    const displayName = catalogAsset?.name ?? asset.name;
    const formatDisplayRate = (value: number) =>
        new Intl.NumberFormat(undefined, {
            minimumFractionDigits: decimalPlaces,
            maximumFractionDigits: decimalPlaces,
        }).format(value);
    const formatEditValue = (value: number) => value.toFixed(decimalPlaces);

    const formatForDisplayFromString = (valStr: string) => {
        const s = String(valStr ?? '');
        const cleaned = s.replace(/,/g, '');
        const parsed = Number(cleaned);
        return (s !== '' && Number.isFinite(parsed)) ? formatDisplayRate(parsed) : s;
    };

    const displayRate = formatDisplayRate(asset.rate);
    const editRate = formatEditValue(asset.rate);
    const [draft, setDraft] = useState(draftValue ?? editRate);
    const [focused, setFocused] = useState(false);
    const [selection, setSelection] = useState<{start: number; end: number} | undefined>(undefined);

    useEffect(() => {
        if (!focused && draftValue === undefined) setDraft(editRate);
    }, [asset.rate, decimalPlaces, editRate, focused, draftValue]);

    const currentValue = draftValue ?? draft;

    const commit = (value: string) => {
        const trimmed = value.trim().replace(/,/g, '');
        const parsed = Number(trimmed);
        if (!trimmed || !Number.isFinite(parsed) || parsed <= 0) {
            setDraft(editRate);
            return;
        }
        onCommit(asset.symbol, trimmed);
        setDraft(parsed.toFixed(decimalPlaces));
    };

    const positive = asset.changePct >= 0;
    const isEquity = asset.category === 'equity';
    const s = makeRowStyles(colors, active, isEquity, positive);

    const finishEditing = () => {
        commit(currentValue);
        setFocused(false);
        setSelection(undefined);
        onDeactivate?.();
    };

    return (
        <View style={s.row}>
            <View style={s.assetColumn}>
                <Text style={s.symbol} numberOfLines={1}>{displaySymbol}</Text>
                <Text style={s.name} numberOfLines={1}>{displayName}</Text>
            </View>
            <View style={s.rateColumn}>
                {isEquity ? (
                    <Text
                        style={[s.input, {borderWidth: 0}]}
                        accessibilityLabel={`Rate for ${displaySymbol}`}
                    >
                        {displayRate}
                    </Text>
                ) : (
                    <TextInput
                        value={focused ? currentValue.replace(/,/g, '') : formatForDisplayFromString(currentValue)}
                        onFocus={() => {
                            setFocused(true);
                            onActivate?.();
                            const raw = String(currentValue ?? '').replace(/,/g, '');
                            const len = raw.length;
                            // ensure native selection after focus/re-render
                            setTimeout(() => setSelection({start: 0, end: len}), 0);
                        }}
                        onChangeText={(text) => {
                            if (onDraftChange) onDraftChange(asset.symbol, text);
                            else setDraft(text);
                            // keep cursor at end while typing
                            setSelection({start: text.length, end: text.length});
                        }}
                        onBlur={() => {
                            finishEditing();
                            setSelection(undefined);
                        }}
                        onSubmitEditing={finishEditing}
                        selection={focused ? selection : undefined}
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        style={s.input}
                        accessibilityLabel={`Rate for ${displaySymbol}`}
                    />
                )}
            </View>
            <View style={s.changeColumn}>
                <Text style={s.changeText}>{positive ? '+' : ''}{asset.changePct.toFixed(2)}%</Text>
            </View>
        </View>
    );
};
