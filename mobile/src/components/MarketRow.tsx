import React, {useEffect, useRef, useState,} from 'react';

import {Text, TextInput, View,} from 'react-native';
import {makeRowStyles} from './MarketRow.styles';

import { MarketAsset } from '../models';
import {CRYPTO_DEFAULT_CATALOG} from '../catalogs';
import {AppColors,} from '../theme';

interface MarketRowProps {
    asset: MarketAsset;
    decimalPlaces: number;
    colors: AppColors;
    draftValue?: string | undefined;
    onDraftChange?: ((symbol: string, value: string) => void) | undefined;
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
    const catalogAsset = asset.category === 'crypto'
        ? CRYPTO_DEFAULT_CATALOG.find(item => item.id === asset.symbol)
        : undefined;

    // Crypto symbols are presentation data. Always prefer the canonical built-in
    // symbol (BTC, ETH, etc.) over a stale or provider-specific value.
    const displaySymbol = catalogAsset?.displaySymbol ?? asset.displaySymbol ?? asset.symbol;
    const displayName = catalogAsset?.name ?? asset.name;
    const formatted = asset.rate.toFixed(decimalPlaces);

    const [draft, setDraft] = useState(draftValue ?? formatted);
    const [focused, setFocused] = useState(false);
    const lastCommittedRate = useRef(asset.rate);

    useEffect(() => {
        if (!focused) {
            const next = asset.rate.toFixed(decimalPlaces);
            if (next !== draft) setDraft(next);
            lastCommittedRate.current = asset.rate;
        }
    }, [asset.rate, decimalPlaces, focused]);

    useEffect(() => {
        if (!focused && typeof draftValue === 'string' && draftValue !== draft) {
            setDraft(draftValue);
        }
    }, [draftValue, focused]);

    const commit = (value: string) => {
        const trimmed = value.trim();
        const parsed = Number(trimmed);

        if (!trimmed || !Number.isFinite(parsed) || parsed <= 0) {
            setDraft(formatted);
            return;
        }

        onCommit(asset.symbol, trimmed);
        lastCommittedRate.current = parsed;
        setDraft(parsed.toFixed(decimalPlaces));
    };

    const positive = asset.changePct >= 0;
    const s = makeRowStyles(colors, active, asset.category === 'equity', positive);

    return (
        <View style={s.row}>
            <View style={s.assetColumn}>
                <Text style={s.symbol} numberOfLines={1}>
                    {displaySymbol}
                </Text>
                <Text style={s.name} numberOfLines={1}>
                    {displayName}
                </Text>
            </View>

            <View style={s.rateColumn}>
                {asset.category === 'equity' ? (
                    <Text style={s.input} accessibilityLabel={`Rate for ${displaySymbol}`}>
                        {formatted}
                    </Text>
                ) : (
                    <TextInput
                        value={draftValue ?? draft}
                        onFocus={() => {
                            setFocused(true);
                            onActivate?.();
                        }}
                        onChangeText={(text) => {
                            if (onDraftChange) onDraftChange(asset.symbol, text);
                            else setDraft(text);
                        }}
                        onBlur={() => {
                            setFocused(false);
                            onDeactivate?.();
                        }}
                        onSubmitEditing={() => {
                            setFocused(false);
                            commit(draftValue ?? draft);
                        }}
                        selectTextOnFocus
                        keyboardType="decimal-pad"
                        returnKeyType="done"
                        style={s.input}
                        accessibilityLabel={`Rate for ${displaySymbol}`}
                    />
                )}
            </View>

            <View style={s.changeColumn}>
                <Text style={s.changeText}>
                    {positive ? '+' : ''}
                    {asset.changePct.toFixed(2)}%
                </Text>
            </View>
        </View>
    );
};
