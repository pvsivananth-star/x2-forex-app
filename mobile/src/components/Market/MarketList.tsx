import React, {useState} from 'react';
import {FlatList} from 'react-native';
import { MarketRate } from '../../models';
import {MarketRow} from './MarketRow';

export function MarketList({data, editable = false, onRateChange, activeSymbol}: {
    data: MarketRate[];
    editable?: boolean;
    onRateChange?: (symbol: string, value: number) => void;
    activeSymbol?: string | null
}) {
    const [focusedSymbol, setFocusedSymbol] = useState<string | null>(null);

    return (
        <FlatList
            data={data}
            keyExtractor={x => x.symbol}
            renderItem={({item}) => (
                <MarketRow
                    item={item}
                    editable={editable && item.symbol !== 'USD'}
                    active={item.symbol === (focusedSymbol ?? activeSymbol)}
                    onChange={v => onRateChange?.(item.symbol, v)}
                    onActivate={() => setFocusedSymbol(item.symbol)}
                    onDeactivate={() => setFocusedSymbol(null)}
                />
            )}
        />
    );
}
