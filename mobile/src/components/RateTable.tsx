import React, {useEffect, useRef, useState,} from 'react';

import {Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {styles, headerStyles, rowStyles} from './RateTable.styles';

import {MarketAsset, TabCategory, Tenor,} from '../models';

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

interface RateInputProps {
    symbol: string;
    value: string;
    externalValue: string;
    colors: any;
    isManual: boolean;
    active?: boolean;
    onActivate?: () => void;
    onDeactivate?: () => void;
    onInputChange: (
        symbol: string,
        value: string,
    ) => void;
    onSubmitRate: (
        symbol: string,
    ) => void;
}

const RateInput: React.FC<RateInputProps> = ({
                                                 symbol,
                                                 value,
                                                 externalValue,
                                                 colors,
                                                 isManual,
                                                 active = false,
                                                 onActivate,
                                                 onDeactivate,
                                                 onInputChange,
                                                 onSubmitRate,
                                             }) => {
    const [draft, setDraft] =
        useState(value);

    const [focused, setFocused] =
        useState(false);

    const focusedRef =
        useRef(false);

    /*
     * External recalculation must NEVER
     * overwrite the field while the user
     * has focus on it.
     */
    useEffect(() => {
        if (focusedRef.current) {
            return;
        }

        setDraft(externalValue);
    }, [externalValue]);

    /*
     * Parent inputValues can change when another
     * field is committed. Do not disturb this
     * field if it currently owns focus.
     */
    useEffect(() => {
        if (focusedRef.current) {
            return;
        }

        setDraft(value);
    }, [value]);

    const commit = () => {
        const committed =
            draft
                .replace(/,/g, '')
                .trim();

        if (!committed) {
            setDraft(externalValue);
            return;
        }

        const number =
            Number(committed);

        if (
            !Number.isFinite(number) ||
            number <= 0
        ) {
            setDraft(externalValue);
            return;
        }

        /*
         * Tell the parent ONLY when editing
         * has finished.
         */
        onInputChange(
            symbol,
            committed,
        );

        onSubmitRate(symbol);
    };

    return (
        <TextInput
            keyboardType="decimal-pad"
            returnKeyType="done"
            selectTextOnFocus
            value={focused ? draft : draft}
            onFocus={() => {
                focusedRef.current = true;
                setFocused(true);
                onActivate?.();

                /*
                 * Always remove thousands separators
                 * while this field is being edited.
                 */
                setDraft(
                    draft.replace(/,/g, ''),
                );
            }}
            onChangeText={(text) => {
                /*
                 * Never allow comma separators
                 * inside the editable field.
                 */
                const cleaned =
                    text.replace(/,/g, '');

                setDraft(cleaned);
            }}
            onBlur={() => {
                // Do not commit on blur — wait for explicit submit (Enter/Done).
                focusedRef.current = false;
                setFocused(false);
                onDeactivate?.();
            }}
            onSubmitEditing={() => {
                // Commit only when user submits (Enter/Done)
                commit();

                focusedRef.current = false;
                setFocused(false);
            }}
            style={[
                styles.input,
                {
                    color: colors.accent,
                    backgroundColor:
                    colors.surface,

                    // Use parent-controlled 'active' to show dark border immediately when focus moves.
                    // Do not display the previous manual/yellow highlight while merely moving focus.
                    borderColor: active ? '#222' : colors.border,

                    borderWidth: active ? 1.5 : 1,
                },
            ]}
            accessibilityLabel={
                `Rate for ${symbol}`
            }
        />
    );
};

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
    const [focusedSymbol, setFocusedSymbol] = useState<string | null>(null);
    const h = headerStyles(colors);
    /*
     * Non-editing values use comma separators.
     *
     * The focused RateInput strips them locally.
     */
    const formatRate = (
        rate: number,
    ) =>
        rate.toLocaleString(
            'en-US',
            {
                minimumFractionDigits:
                decimalPlaces,
                maximumFractionDigits:
                decimalPlaces,
            },
        );

    return (
        <View>
            <View style={h.header}>
                <Text style={h.assetHeader}>Asset</Text>

                <Text style={h.rateHeader}>Rate</Text>

                <TouchableOpacity
                    style={
                        styles.changeHeader
                    }
                    onPress={
                        onTenorPress
                    }
                >
                    <Text style={h.headerText(colors)}>% {tenor} ▾</Text>
                </TouchableOpacity>
            </View>

            {watchlist.map(
                symbol => {
                    const asset =
                        assets[symbol];

                    if (!asset) {
                        return null;
                    }

                    const externalValue =
                        formatRate(
                            asset.rate,
                        );

                    const value =
                        inputValues[
                            symbol
                            ] ??
                        externalValue;

                    const isManual =
                        editingSymbol ===
                        symbol &&
                        asset.isCustomEdited;

                    const r: any = rowStyles(colors, focusedSymbol === symbol, asset.changePct >= 0);

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
                            <View
                                style={
                                    styles.asset
                                }
                            >
                                <Text style={r.symbol(colors)}>
                                    {
                                        category ===
                                        'crypto' &&
                                        symbol ===
                                        'BTC'
                                            ? '₿ BTC'
                                            : symbol
                                    }
                                </Text>

                                <Text
                                    numberOfLines={
                                        1
                                    }
                                    style={r.name(colors)}>

                                    {
                                        asset.name
                                    }
                                </Text>
                            </View>

                            <View style={r.rate}>
                                <RateInput
                                    symbol={symbol}
                                    value={value}
                                    externalValue={externalValue}
                                    colors={colors}
                                    isManual={isManual}
                                    active={focusedSymbol === symbol}
                                    onActivate={() => setFocusedSymbol(symbol)}
                                    onDeactivate={() => setFocusedSymbol(null)}
                                    onInputChange={onInputChange}
                                    onSubmitRate={onSubmitRate}
                                />
                            </View>

                            <View style={r.change}>
                                {!(symbol === 'USD' && (category === 'crypto' || category === 'metals')) ? (
                                    <Text style={r.changeText(colors, asset.changePct >= 0)}>

                                        {asset.changePct >= 0 ? '+' : ''}{asset.changePct.toFixed(2)}%
                                    </Text>
                                ) : (
                                    <Text />
                                )}
                            </View>
                        </View>
                    );
                },
            )}
        </View>
    );
};

// styles extracted
