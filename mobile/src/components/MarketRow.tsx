import React, {
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    MarketAsset,
} from '../types';

import {
    AppColors,
} from '../theme';

interface MarketRowProps {
    asset: MarketAsset;
    decimalPlaces: number;
    colors: AppColors;

    onCommit: (
        symbol: string,
        value: string,
    ) => void;
}

export const MarketRow: React.FC<
    MarketRowProps
> = ({
         asset,
         decimalPlaces,
         colors,
         onCommit,
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
                <TextInput
                    value={draft}
                    onFocus={() =>
                        setFocused(true)
                    }
                    onChangeText={
                        setDraft
                    }
                    onBlur={() => {
                        setFocused(false);
                        commit(draft);
                    }}
                    onSubmitEditing={() => {
                        setFocused(false);
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

                            borderColor:
                                asset.isCustomEdited
                                    ? colors.warning
                                    : colors.border,

                            borderWidth:
                                asset.isCustomEdited
                                    ? 1.5
                                    : 1,
                        },
                    ]}
                    accessibilityLabel={
                        `Rate for ${displaySymbol}`
                    }
                />
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

const styles =
    StyleSheet.create({
        row: {
            minHeight: 48,
            height: 48,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
        },

        assetColumn: {
            flex: 2,
            paddingRight: 6,
        },

        rateColumn: {
            flex: 1.55,
            alignItems: 'flex-end',
        },

        changeColumn: {
            flex: 0.95,
            alignItems: 'flex-end',
        },

        symbol: {
            fontSize: 13,
            fontWeight: '900',
        },

        name: {
            fontSize: 9,
            marginTop: 1,
        },

        input: {
            minWidth: 88,
            height: 34,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 3,
            textAlign: 'right',
            fontSize: 13,
            fontWeight: '800',
        },

        change: {
            fontSize: 11,
            fontWeight: '900',
        },
    });