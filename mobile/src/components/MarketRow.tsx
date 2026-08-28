import React, {useEffect, useRef, useState,} from 'react';

import {Text, TextInput, View,} from 'react-native';
import {makeRowStyles} from './MarketRow.styles';

import { MarketAsset } from '../models';

import {AppColors,} from '../theme';

interface MarketRowProps {
    asset: MarketAsset;
    decimalPlaces: number;
    colors: AppColors;

    onCommit: (
        symbol: string,
        value: string,
    ) => void;

    // Optional focus callbacks and visual active flag
    active?: boolean;
    onActivate?: () => void;
    onDeactivate?: () => void;
}

export const MarketRow: React.FC<
    MarketRowProps
> = ({
         asset,
         decimalPlaces,
         colors,
         onCommit,
         active = false,
         onActivate,
         onDeactivate,
     }) => {
    const displaySymbol = asset.displaySymbol ?? asset.symbol;

    const formatted = asset.rate.toFixed(decimalPlaces);

    const [draft, setDraft] = useState(formatted);

    const [focused, setFocused] = useState(false);

    const lastCommittedRate = useRef(asset.rate);

    useEffect(() => {
        if (!focused) {
            const next = asset.rate.toFixed(decimalPlaces);

            if (next !== draft) {
                setDraft(next);
            }

            lastCommittedRate.current = asset.rate;
        }
    }, [asset.rate, decimalPlaces, focused]);

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
                    {asset.name}
                </Text>
            </View>

            <View style={s.rateColumn}>
                {asset.category === 'equity' ? (
                    // Render a non-editable label for equity rates
                    <Text style={s.input} accessibilityLabel={`Rate for ${displaySymbol}`}>
                        {formatted}
                    </Text>
                ) : (
                    <TextInput
                        value={draft}
                        onFocus={() => {
                            setFocused(true);
                            onActivate?.();
                        }}
                        onChangeText={setDraft}
                        onBlur={() => {
                            // Do not commit on blur — only commit on explicit submit (enter/tab).
                            setFocused(false);
                            onDeactivate?.();
                        }}

                        onSubmitEditing={() => {
                            setFocused(false);
                            // Commit only when user submits (Enter/Done)
                            commit(draft);
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

