import React, {useEffect, useState,} from 'react';

import {Text, TextInput, View,} from 'react-native';
import {makeRowStyles} from './MarketRow.styles';

import { MarketAsset } from '../models';
import { AppColors,} from '../theme';

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
    asset,
    decimalPlaces,
    colors,
    draftValue,
    onDraftChange,
    onCommit,
    active = false,
    onActivate,
    onDeactivate,
}) => {
    const formatted = asset.rate.toFixed(decimalPlaces);
    const [draft, setDraft] = useState(draftValue ?? formatted);
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        if (!focused) {
            const next = draftValue ?? asset.rate.toFixed(decimalPlaces);
            if (next !== draft) setDraft(next);
        }
    }, [asset.rate, decimalPlaces, draftValue, focused]);

    const changeDraft = (value: string) => {
        setDraft(value);
        onDraftChange?.(asset.symbol, value);
    };

    const commit = (value: string) => {
        const trimmed = value.trim();
        const parsed = Number(trimmed);

        if (!trimmed || !Number.isFinite(parsed) || parsed <= 0) {
            const reset = draftValue ?? formatted;
            setDraft(reset);
            return;
        }

        onCommit(asset.symbol, trimmed);
        setDraft(parsed.toFixed(decimalPlaces));
    };

    const positive = asset.changePct >= 0;
    const s = makeRowStyles(colors, active, asset.category === 'equity', positive);

    return (
        <View style={s.row}>
            <View style={s.assetColumn}>
                <Text style={s.symbol} numberOfLines={1}>{asset.displaySymbol ?? asset.symbol}</Text>
                <Text style={s.name} numberOfLines={1}>{asset.name}</Text>
            </View>

            <View style={s.rateColumn}>
                {asset.category === 'equity' ? (
                    <Text style={s.input} accessibilityLabel={`Rate for ${asset.displaySymbol ?? asset.symbol}`}>
                        {formatted}
                    </Text>
                ) : (
                    <TextInput
                        value={draft}
                        onFocus={() => {
                            setFocused(true);
                            onActivate?.();
                        }}
                        onChangeText={changeDraft}
                        onBlur={() => {
                            setFocused(false);
                            onDeactivate?.();
                        }}
                        onSubmitEditing={() => {
                            commit(draft);
                            setFocused(false);
                            onDeactivate?.();
                        }}
                        selectTextOnFocus
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        style={s.input}
                        accessibilityLabel={`Rate for ${asset.displaySymbol ?? asset.symbol}`}
                    />
                )}
            </View>

            <View style={s.changeColumn}>
                <Text style={s.changeText}>
                    {positive ? '+' : ''}{asset.changePct.toFixed(2)}%
                </Text>
            </View>
        </View>
    );
};
