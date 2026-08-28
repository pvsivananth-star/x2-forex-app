import React, {useEffect, useRef, useState,} from 'react';

import {Text, TextInput, View,} from 'react-native';
import {styles} from './MarketRow.styles';

import {MarketAsset,} from '../types';

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
    const displaySymbol =
        asset.displaySymbol ??
        asset.symbol;

    const formatted =
        asset.rate.toFixed(
            decimalPlaces,
        );

    const [draft, setDraft] =
        useState(formatted);

    const [focused, setFocused] =
        useState(false);

    const lastCommittedRate =
        useRef(asset.rate);

    useEffect(() => {
        if (!focused) {
            const next =
                asset.rate.toFixed(
                    decimalPlaces,
                );

            if (
                next !== draft
            ) {
                setDraft(next);
            }

            lastCommittedRate.current =
                asset.rate;
        }
    }, [
        asset.rate,
        decimalPlaces,
        focused,
    ]);
    
    const commit = (
        value: string,
    ) => {
        const trimmed =
            value.trim();

        const parsed =
            Number(trimmed);

        if (
            !trimmed ||
            !Number.isFinite(parsed) ||
            parsed <= 0
        ) {
            setDraft(formatted);
            return;
        }

        onCommit(
            asset.symbol,
            trimmed,
        );

        lastCommittedRate.current =
            parsed;

        setDraft(
            parsed.toFixed(
                decimalPlaces,
            ),
        );
    };

    const positive =
        asset.changePct >= 0;

    return (
        <View
            style={[
                styles.row,
                {
                    borderBottomColor:
                    colors.border,
                },
            ]}
        >
            <View
                style={
                    styles.assetColumn
                }
            >
                <Text
                    style={[
                        styles.symbol,
                        {
                            color:
                            colors.text,
                        },
                    ]}
                    numberOfLines={1}
                >
                    {displaySymbol}
                </Text>

                <Text
                    style={[
                        styles.name,
                        {
                            color:
                            colors.dim,
                        },
                    ]}
                    numberOfLines={1}
                >
                    {asset.name}
                </Text>
            </View>

            <View
                style={
                    styles.rateColumn
                }
            >
                {asset.category === 'equity' ? (
                    // Render a non-editable label for equity rates
                    <Text
                        style={[
                            styles.input,
                            {
                                color: colors.text,
                                backgroundColor: 'transparent',
                                borderWidth: 0,
                                textAlign: 'right',
                            },
                        ]}
                        accessibilityLabel={`Rate for ${displaySymbol}`}
                    >
                        {formatted}
                    </Text>
                ) : (
                    <TextInput
                        value={draft}
                        onFocus={() => {
                            setFocused(true);
                            onActivate?.();
                        }}
                        onChangeText={
                            setDraft
                        }
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
                        style={[
                            styles.input,
                            {
                                color:
                                colors.text,

                                backgroundColor:
                                colors.surface,

                                // Show dark border only when the parent marks this row active.
                                // Avoid relying on local focus state for visuals so the parent-controlled
                                // active indicator updates immediately when focus moves.
                                borderColor: active ? '#222' : colors.border,

                                borderWidth: active ? 1.5 : 1,
                            },
                        ]}
                        accessibilityLabel={
                            `Rate for ${displaySymbol}`
                        }
                    />
                )}
            </View>

            <View
                style={
                    styles.changeColumn
                }
            >
                <Text
                    style={[
                        styles.change,
                        {
                            color:
                                positive
                                    ? colors.positive
                                    : colors.negative,
                        },
                    ]}
                >
                    {positive
                        ? '+'
                        : ''}
                    {asset.changePct.toFixed(
                        2,
                    )}
                    %
                </Text>
            </View>
        </View>
    );
};

