import React from 'react';

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
    draftValue?: string;

    onDraftChange: (
        symbol: string,
        value: string,
    ) => void;

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
         draftValue,
         onDraftChange,
         onCommit,
     }) => {
    const displaySymbol =
        asset.displaySymbol ??
        asset.symbol;

    const formatted =
        asset.rate.toFixed(
            decimalPlaces,
        );

    const value =
        draftValue ??
        formatted;

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
                style={styles.assetColumn}
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
                style={styles.rateColumn}
            >
                <TextInput
                    value={value}
                    onChangeText={(text) =>
                        onDraftChange(
                            asset.symbol,
                            text,
                        )
                    }
                    onBlur={() =>
                        onCommit(
                            asset.symbol,
                            value,
                        )
                    }
                    onSubmitEditing={() =>
                        onCommit(
                            asset.symbol,
                            value,
                        )
                    }
                    selectTextOnFocus
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    style={[
                        styles.input,
                        {
                            color:
                            colors.accent,

                            backgroundColor:
                            colors.surface,

                            borderColor:
                                asset.isCustomEdited
                                    ? colors.warning
                                    : colors.border,
                        },
                    ]}
                    accessibilityLabel={`Rate for ${displaySymbol}`}
                />
            </View>

            <View
                style={styles.changeColumn}
            >
                <Text
                    style={[
                        styles.change,
                        {
                            color: positive
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
            minHeight: 62,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
        },

        assetColumn: {
            flex: 2,
            paddingRight: 8,
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
            fontSize: 14,
            fontWeight: '900',
        },

        name: {
            fontSize: 10,
            marginTop: 3,
        },

        input: {
            minWidth: 88,
            borderWidth: 1,
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 6,
            textAlign: 'right',
            fontSize: 13,
            fontWeight: '800',
        },

        change: {
            fontSize: 12,
            fontWeight: '900',
        },
    });