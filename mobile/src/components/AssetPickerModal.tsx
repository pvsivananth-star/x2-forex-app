import React, {useMemo,} from 'react';

import {FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';

import {MarketAsset,} from '../types';

import {AppColors,} from '../theme';

interface AssetPickerModalProps {
    visible: boolean;
    title: string;
    placeholder: string;

    assets: MarketAsset[];
    selected: string[];

    search: string;

    colors: AppColors;

    onSearch: (
        value: string,
    ) => void;

    onSelect: (
        symbol: string,
    ) => void;

    onClose: () => void;
}

export const AssetPickerModal: React.FC<
    AssetPickerModalProps
> = ({
         visible,
         title,
         placeholder,
         assets,
         selected,
         search,
         colors,
         onSearch,
         onSelect,
         onClose,
     }) => {
    const query =
        search
            .trim()
            .toLowerCase();

    const filtered =
        useMemo(() => {
            if (!query) {
                return assets;
            }

            return assets.filter(
                (asset) =>
                    asset.name
                        .toLowerCase()
                        .includes(query) ||
                    (
                        asset.displaySymbol ??
                        asset.symbol
                    )
                        .toLowerCase()
                        .includes(
                            query,
                        ) ||
                    asset.symbol
                        .toLowerCase()
                        .includes(
                            query,
                        ),
            );
        }, [
            assets,
            query,
        ]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={
                onClose
            }
        >
            <View
                style={[
                    styles.backdrop,
                    {
                        backgroundColor:
                        colors.overlay,
                    },
                ]}
            >
                <View
                    style={[
                        styles.modal,
                        {
                            backgroundColor:
                            colors.surfaceElevated,

                            borderColor:
                            colors.border,
                        },
                    ]}
                >
                    <View
                        style={
                            styles.header
                        }
                    >
                        <View
                            style={
                                styles.headerText
                            }
                        >
                            <Text
                                style={[
                                    styles.title,
                                    {
                                        color:
                                        colors.text,
                                    },
                                ]}
                            >
                                {title}
                            </Text>

                            <Text
                                style={[
                                    styles.count,
                                    {
                                        color:
                                        colors.dim,
                                    },
                                ]}
                            >
                                {query
                                    ? `${filtered.length} matches`
                                    : `${assets.length} available`}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={
                                onClose
                            }
                        >
                            <Text
                                style={[
                                    styles.close,
                                    {
                                        color:
                                        colors.muted,
                                    },
                                ]}
                            >
                                ×
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        value={search}
                        onChangeText={
                            onSearch
                        }
                        autoFocus
                        placeholder={
                            placeholder
                        }
                        placeholderTextColor={
                            colors.dim
                        }
                        style={[
                            styles.search,
                            {
                                color:
                                colors.text,

                                backgroundColor:
                                colors.surface,

                                borderColor:
                                colors.border,
                            },
                        ]}
                    />

                    <FlatList
                        data={filtered}
                        keyExtractor={(
                            item,
                        ) =>
                            item.symbol
                        }
                        style={
                            styles.results
                        }
                        keyboardShouldPersistTaps="handled"
                        initialNumToRender={
                            40
                        }
                        maxToRenderPerBatch={
                            40
                        }
                        windowSize={8}
                        removeClippedSubviews
                        renderItem={({
                                         item,
                                     }) => {
                            const symbol =
                                item.symbol;

                            const alreadySelected =
                                selected.includes(
                                    symbol,
                                );

                            const displaySymbol =
                                item.displaySymbol ??
                                symbol;

                            return (
                                <TouchableOpacity
                                    disabled={
                                        alreadySelected
                                    }
                                    onPress={() =>
                                        onSelect(
                                            symbol,
                                        )
                                    }
                                    style={[
                                        styles.result,
                                        {
                                            borderBottomColor:
                                            colors.border,

                                            opacity:
                                                alreadySelected
                                                    ? 0.4
                                                    : 1,
                                        },
                                    ]}
                                >
                                    <View
                                        style={
                                            styles.resultText
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
                                        >
                                            {
                                                displaySymbol
                                            }
                                        </Text>

                                        <Text
                                            style={[
                                                styles.name,
                                                {
                                                    color:
                                                    colors.muted,
                                                },
                                            ]}
                                            numberOfLines={
                                                1
                                            }
                                        >
                                            {
                                                item.name
                                            }
                                        </Text>
                                    </View>

                                    {alreadySelected && (
                                        <Text
                                            style={[
                                                styles.added,
                                                {
                                                    color:
                                                    colors.positive,
                                                },
                                            ]}
                                        >
                                            Added
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={
                            <Text
                                style={[
                                    styles.empty,
                                    {
                                        color:
                                        colors.muted,
                                    },
                                ]}
                            >
                                No matching assets
                            </Text>
                        }
                    />

                    <TouchableOpacity
                        onPress={
                            onClose
                        }
                        style={[
                            styles.cancel,
                            {
                                borderColor:
                                colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color:
                                colors.muted,
                                fontWeight:
                                    '800',
                            }}
                        >
                            Close
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles =
    StyleSheet.create({
        backdrop: {
            flex: 1,
            alignItems: 'center',
            justifyContent:
                'center',
            padding: 18,
        },

        modal: {
            width: '100%',
            height: '88%',
            borderRadius: 16,
            borderWidth: 1,
            padding: 16,
        },

        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent:
                'space-between',
            marginBottom: 12,
        },

        headerText: {
            flex: 1,
        },

        title: {
            fontSize: 18,
            fontWeight: '900',
        },

        count: {
            fontSize: 10,
            marginTop: 3,
            fontWeight: '700',
        },

        close: {
            fontSize: 28,
            lineHeight: 28,
        },

        search: {
            borderWidth: 1,
            borderRadius: 9,
            paddingHorizontal: 12,
            paddingVertical: 10,
            fontSize: 14,
            marginBottom: 8,
        },

        results: {
            flex: 1,
        },

        result: {
            minHeight: 54,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent:
                'space-between',
            borderBottomWidth: 1,
        },

        resultText: {
            flex: 1,
            paddingRight: 10,
        },

        symbol: {
            fontSize: 14,
            fontWeight: '900',
        },

        name: {
            fontSize: 11,
            marginTop: 3,
        },

        added: {
            fontSize: 11,
            fontWeight: '900',
        },

        empty: {
            textAlign: 'center',
            paddingVertical: 30,
            fontSize: 13,
        },

        cancel: {
            alignSelf: 'flex-end',
            marginTop: 10,
            paddingHorizontal: 18,
            paddingVertical: 9,
            borderWidth: 1,
            borderRadius: 8,
        },
    });