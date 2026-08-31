import React, {useMemo,} from 'react';

import {FlatList, Modal, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {styles, themed} from './AssetPickerModal.styles';

import { MarketAsset } from '../models';

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
    const query = search.trim().toLowerCase();

    const filtered = useMemo(() => {
        if (!query) {
            return assets;
        }

        return assets.filter((asset) =>
            asset.name.toLowerCase().includes(query) ||
            (asset.displaySymbol ?? asset.symbol).toLowerCase().includes(query) ||
            asset.symbol.toLowerCase().includes(query),
        );
    }, [assets, query]);

    const s = themed(colors);

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            <View style={s.backdrop}>
                <View style={s.modal}>
                    <View style={s.header}>
                        <View style={s.headerText}>
                            <Text style={s.title}>{title}</Text>

                            <Text style={s.count}>{query ? `${filtered.length} matches` : `${assets.length} available`}</Text>
                        </View>

                        <TouchableOpacity onPress={onClose}>
                            <Text style={s.close}>×</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        value={search}
                        onChangeText={onSearch}
                        autoFocus
                        placeholder={placeholder}
                        placeholderTextColor={colors.dim}
                        style={s.search(colors)}
                    />

                    <FlatList
                        data={filtered}
                        keyExtractor={(item) => item.symbol}
                        style={s.results}
                        keyboardShouldPersistTaps="handled"
                        initialNumToRender={40}
                        maxToRenderPerBatch={40}
                        windowSize={8}
                        removeClippedSubviews
                        renderItem={({item}) => {
                            const symbol = item.symbol;

                            const alreadySelected = selected.includes(symbol);

                            const displaySymbol = item.displaySymbol ?? symbol;

                            return (
                                <TouchableOpacity
                                    disabled={alreadySelected}
                                    onPress={() => onSelect(symbol)}
                                    style={s.result(colors, alreadySelected)}
                                >
                                    <View style={s.resultText}>
                                        <Text style={s.symbol(colors)}>{displaySymbol}</Text>

                                        <Text style={s.name(colors)} numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                    </View>

                                    {alreadySelected && <Text style={s.added(colors)}>Added</Text>}
                                </TouchableOpacity>
                            );
                        }}
                        ListEmptyComponent={<Text style={s.empty(colors)}>No matching assets</Text>}
                    />

                    <TouchableOpacity onPress={onClose} style={s.cancel(colors)}>
                        <Text style={{color: colors.muted, fontWeight: '800'}}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// styles extracted
