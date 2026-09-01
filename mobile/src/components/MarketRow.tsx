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
    const formatted = asset.rate.toFixed(decimalPlaces);
    const [draft, setDraft] = useState(draftValue ?? formatted);
    const [focused, setFocused] = useState(false);

    useEffect(() => {
        if (!focused && draftValue === undefined) setDraft(formatted);
    }, [asset.rate, decimalPlaces, focused, draftValue, formatted]);

    const currentValue = draftValue ?? draft;

    const commit = (value: string) => {
        const trimmed = value.trim();
        const parsed = Number(trimmed);
        if (!trimmed || !Number.isFinite(parsed) || parsed <= 0) {
            setDraft(formatted);
            return;
        }
        onCommit(asset.symbol, trimmed);
        setDraft(parsed.toFixed(decimalPlaces));
    };

    const positive = asset.changePct >= 0;
    const s = makeRowStyles(colors, active, asset.category === 'equity', positive);

    const finishEditing = () => {
        // Blur is the reliable cross-platform signal that the user has
        // moved focus away from this field. Commit before clearing edit state.
        commit(currentValue);
        setFocused(false);
        onDeactivate?.();
    };

    return (
        <View style={s.row}>
            <View style={s.assetColumn}>
                <Text style={s.symbol} numberOfLines={1}>{displaySymbol}</Text>
                <Text style={s.name} numberOfLines={1}>{displayName}</Text>
            </View>
            <View style={s.rateColumn}>
                {asset.category === 'equity' ? (
                    <Text style={s.input} accessibilityLabel={`Rate for ${displaySymbol}`}>{formatted}</Text>
                ) : (
                    <TextInput
                        value={currentValue}
                        onFocus={() => {
                            setFocused(true);
                            onActivate?.();
                        }}
                        onChangeText={(text) => {
                            if (onDraftChange) onDraftChange(asset.symbol, text);
                            else setDraft(text);
                        }}
                        onBlur={finishEditing}
                        onSubmitEditing={finishEditing}
                        selectTextOnFocus
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
