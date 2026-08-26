import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    MarketAsset,
    TabCategory,
    Tenor,
} from '../MobileService';

interface RateTableProps {
    colors: any;
    assets: Record<string, MarketAsset>;
    watchlist: string[];
    category: TabCategory;
    tenor: Tenor;
    decimalPlaces: number;
    editingSymbol: string | null;
    inputValues: Record<string, string>;
    onInputChange: (
        symbol: string,
        value: string,
    ) => void;
    onSubmitRate: (
        symbol: string,
    ) => void;
    onTenorPress: () => void;
}

export const RateTable: React.FC<
    RateTableProps
> = ({
         colors,
         assets,
         watchlist,
         category,
         tenor,
         decimalPlaces,
         editingSymbol,
         inputValues,
         onInputChange,
         onSubmitRate,
         onTenorPress,
     }) => {
    const formatRate = (rate: number) =>
        rate.toFixed(decimalPlaces);

    return (
        <View>
            <View
                style={[
                    styles.header,
                    {
                        borderBottomColor:
                        colors.border,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.assetHeader,
                        { color: colors.dim },
                    ]}
                >
                    Asset
                </Text>

                <Text
                    style={[
                        styles.rateHeader,
                        { color: colors.dim },
                    ]}
                >
                    Rate
                </Text>

                <TouchableOpacity
                    style={styles.changeHeader}
                    onPress={onTenorPress}
                >
                    <Text
                        style={[
                            styles.headerText,
                            { color: colors.dim },
                        ]}
                    >
                        % {tenor} ▾
                    </Text>
                </TouchableOpacity>
            </View>

            {watchlist.map((symbol) => {
                const asset = assets[symbol];

                if (!asset) {
                    return null;
                }

                const value =
                    inputValues[symbol] ??
                    formatRate(asset.rate);

                const isManual =
                    editingSymbol === symbol &&
                    asset.isCustomEdited;

                return (
                    <View
                        key={symbol}
                        style={[
                            styles.row,
                            {
                                borderBottomColor:
                                colors.border,
                            },
                        ]}
                    >
                        <View style={styles.asset}>
                            <Text
                                style={[
                                    styles.symbol,
                                    { color: colors.text },
                                ]}
                            >
                                {category === 'crypto' &&
                                symbol === 'BTC'
                                    ? '₿ BTC'
                                    : symbol}
                            </Text>

                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.name,
                                    { color: colors.dim },
                                ]}
                            >
                                {asset.name}
                            </Text>
                        </View>

                        <View style={styles.rate}>
                            <TextInput
                                keyboardType="decimal-pad"
                                returnKeyType="done"
                                selectTextOnFocus
                                value={value}
                                onChangeText={(text) =>
                                    onInputChange(
                                        symbol,
                                        text,
                                    )
                                }
                                onSubmitEditing={() =>
                                    onSubmitRate(symbol)
                                }
                                style={[
                                    styles.input,
                                    {
                                        color: colors.accent,
                                        backgroundColor:
                                        colors.surface,
                                        borderColor: isManual
                                            ? colors.yellow
                                            : colors.border,
                                    },
                                ]}
                                accessibilityLabel={`Rate for ${symbol}`}
                            />
                        </View>

                        <View style={styles.change}>
                            <Text
                                style={[
                                    styles.changeText,
                                    {
                                        color:
                                            asset.changePct >= 0
                                                ? colors.green
                                                : colors.red,
                                    },
                                ]}
                            >
                                {asset.changePct >= 0
                                    ? '+'
                                    : ''}
                                {asset.changePct.toFixed(2)}%
                            </Text>
                        </View>
                    </View>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
    },

    assetHeader: {
        flex: 2,
    },

    rateHeader: {
        flex: 1.5,
        fontSize: 10,
        fontWeight: '800',
    },

    changeHeader: {
        flex: 1,
        alignItems: 'flex-end',
    },

    headerText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 57,
        borderBottomWidth: 1,
    },

    asset: {
        flex: 2,
        justifyContent: 'center',
    },

    symbol: {
        fontSize: 14,
        fontWeight: '800',
    },

    name: {
        fontSize: 10,
        marginTop: 2,
    },

    rate: {
        flex: 1.5,
        alignItems: 'flex-end',
    },

    input: {
        minWidth: 82,
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 4,
        textAlign: 'right',
        fontSize: 13,
        fontWeight: '700',
    },

    change: {
        flex: 1,
        alignItems: 'flex-end',
    },

    changeText: {
        fontSize: 12,
        fontWeight: '800',
    },
});