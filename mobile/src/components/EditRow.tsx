import React from 'react';

import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    MarketAsset,
} from '../types';

import {
    AppColors,
} from '../theme';

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
                    disabled={
                        locked ||
                        index === 0
                    }
                    onPress={() =>
                        onMove(
                            index,
                            -1,
                        )
                    }
                    style={styles.arrowButton}
                >
                    <Text
                        style={[
                            styles.arrow,
                            {
                                color:
                                    locked ||
                                    index === 0
                                        ? colors.border
                                        : colors.text,
                            },
                        ]}
                    >
                        ↑
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    disabled={
                        locked ||
                        index === count - 1
                    }
                    onPress={() =>
                        onMove(
                            index,
                            1,
                        )
                    }
                    style={styles.arrowButton}
                >
                    <Text
                        style={[
                            styles.arrow,
                            {
                                color:
                                    locked ||
                                    index ===
                                    count - 1
                                        ? colors.border
                                        : colors.text,
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
                            locked ? 0.25 : 1,
                    },
                ]}
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
            minHeight: 60,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderRadius: 8,
            marginBottom: 3,
        },

        arrows: {
            width: 44,
            alignItems: 'center',
        },

        arrowButton: {
            width: 32,
            height: 23,
            alignItems: 'center',
            justifyContent: 'center',
        },

        arrow: {
            fontSize: 17,
            fontWeight: '900',
        },

        asset: {
            flex: 1,
            paddingHorizontal: 6,
        },

        symbol: {
            fontSize: 14,
            fontWeight: '900',
        },

        name: {
            fontSize: 10,
            marginTop: 3,
        },

        remove: {
            width: 48,
            height: 50,
            alignItems: 'center',
            justifyContent: 'center',
        },

        removeText: {
            fontSize: 28,
            fontWeight: '400',
        },
    });