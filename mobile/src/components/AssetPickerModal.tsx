import React from 'react';

import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import {
    MarketAsset,
} from '../types';

import {
    AppColors,
} from '../theme';

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
        !query
            ? assets.slice(0, 50)
            : assets
                .filter(
                    (asset) =>
                        asset.name
                            .toLowerCase()
                            .includes(query) ||
                        (
                            asset.displaySymbol ??
                            asset.symbol
                        )
                            .toLowerCase()
                            .includes(query) ||
                        asset.symbol
                            .toLowerCase()
                            .includes(query),
                )
                .slice(0, 100);

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
                        style={styles.header}
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

                    <Text
                        style={[
                            styles.matching,
                            {
                                color:
                                colors.dim,
                            },
                        ]}
                    >
                        {query
                            ? `${filtered.length} matches`
                            : 'Available assets'}
                    </Text>

                    <ScrollView
                        style={styles.results}
                        keyboardShouldPersistTaps="handled"
                    >
                        {filtered.map(
                            (asset) => {
                                const symbol =
                                    asset.symbol;

                                const alreadySelected =
                                    selected.includes(
                                        symbol,
                                    );

                                const displaySymbol =
                                    asset.displaySymbol ??
                                    symbol;

                                return (
                                    <TouchableOpacity
                                        key={symbol}
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
                                                    asset.name
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
                            },
                        )}

                        {!filtered.length && (
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
                        )}
                    </ScrollView>

                    <TouchableOpacity
                        onPress={onClose}
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
            justifyContent: 'center',
            padding: 18,
        },

        modal: {
            width: '100%',
            maxHeight: '86%',
            borderRadius: 16,
            borderWidth: 1,
            padding: 16,
        },

        header: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent:
                'space-between',
            marginBottom: 14,
        },

        title: {
            fontSize: 18,
            fontWeight: '900',
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
        },

        matching: {
            fontSize: 10,
            fontWeight: '900',
            textTransform:
                'uppercase',
            marginTop: 15,
            marginBottom: 5,
        },

        results: {
            maxHeight: 430,
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
            marginTop: 14,
            paddingHorizontal: 18,
            paddingVertical: 9,
            borderWidth: 1,
            borderRadius: 8,
        },
    });