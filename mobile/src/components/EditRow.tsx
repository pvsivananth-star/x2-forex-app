import React from 'react';

import {StyleSheet, Text, TouchableOpacity, View,} from 'react-native';

import {MarketAsset,} from '../types';

import {AppColors,} from '../theme';

interface EditRowProps {
    asset: MarketAsset;
    index: number;
    count: number;
    locked?: boolean;
    colors: AppColors;

    onMove: (
        index: number,
        direction: -1 | 1,
    ) => void;

    onRemove: (
        symbol: string,
    ) => void;
}

export const EditRow: React.FC<
    EditRowProps
> = ({
         asset,
         index,
         count,
         locked,
         colors,
         onMove,
         onRemove,
     }) => {
    const displaySymbol =
        asset.displaySymbol ??
        asset.symbol;

    const canMoveUp =
        !locked &&
        index > 0;

    const canMoveDown =
        !locked &&
        index < count - 1;

    return (
        <View
            style={[
                styles.row,
                {
                    backgroundColor:
                    colors.surface,

                    borderBottomColor:
                    colors.border,
                },
            ]}
        >
            <View
                style={styles.arrows}
            >
                <TouchableOpacity
                    disabled={!canMoveUp}
                    onPress={() =>
                        onMove(
                            index,
                            -1,
                        )
                    }
                    style={styles.arrowButton}
                    accessibilityRole="button"
                    accessibilityLabel={
                        `Move ${displaySymbol} up`
                    }
                >
                    <Text
                        style={[
                            styles.arrow,
                            {
                                color:
                                    canMoveUp
                                        ? colors.text
                                        : colors.border,
                            },
                        ]}
                    >
                        ↑
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={!canMoveDown}
                    onPress={() =>
                        onMove(
                            index,
                            1,
                        )
                    }
                    style={styles.arrowButton}
                    accessibilityRole="button"
                    accessibilityLabel={
                        `Move ${displaySymbol} down`
                    }
                >
                    <Text
                        style={[
                            styles.arrow,
                            {
                                color:
                                    canMoveDown
                                        ? colors.text
                                        : colors.border,
                            },
                        ]}
                    >
                        ↓
                    </Text>
                </TouchableOpacity>
            </View>

            <View
                style={styles.asset}
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

            <TouchableOpacity
                disabled={locked}
                onPress={() =>
                    onRemove(
                        asset.symbol,
                    )
                }
                style={[
                    styles.remove,
                    {
                        opacity:
                            locked
                                ? 0.25
                                : 1,
                    },
                ]}
                accessibilityRole="button"
                accessibilityLabel={
                    `Remove ${displaySymbol}`
                }
            >
                <Text
                    style={[
                        styles.removeText,
                        {
                            color:
                            colors.negative,
                        },
                    ]}
                >
                    −
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles =
    StyleSheet.create({
        row: {
            minHeight: 40,
            height: 40,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderRadius: 6,
            marginBottom: 1,
        },

        arrows: {
            width: 36,
            alignItems: 'center',
            justifyContent: 'center',
        },

        arrowButton: {
            width: 28,
            height: 18,
            alignItems: 'center',
            justifyContent: 'center',
        },

        arrow: {
            fontSize: 14,
            fontWeight: '900',
        },

        asset: {
            flex: 1,
            paddingHorizontal: 6,
        },

        symbol: {
            fontSize: 13,
            fontWeight: '900',
        },

        name: {
            fontSize: 9,
            marginTop: 1,
        },

        remove: {
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
        },

        removeText: {
            fontSize: 22,
            fontWeight: '400',
        },
    });