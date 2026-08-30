import React, {useState} from 'react';
import {FlatList} from 'react-native';
import {MarketAsset} from '../../models';
import {MarketRow} from './MarketRow';

export function MarketList({data, editable = false, onRateChange, activeSymbol}: {
    data: MarketAsset[];
    editable?: boolean;
    onRateChange?: (symbol: string, value: number) => void;
    activeSymbol?: string | null;
}) {
    const [focusedSymbol, setFocusedSymbol] = useState<string | null>(null);

    return (
        <FlatList
            data={data}
            keyExtractor={x => x.symbol}
            renderItem={({item}) => (
                <MarketRow
                    item={{
                        symbol: item.symbol,
                        name: item.name,
                        displaySymbol: item.displaySymbol,
                        value: item.rate,
                        category: item.category,
                        changePct: item.changePct,
                        referenceRate: item.referenceRate,
                    }}
                    editable={editable}
                    active={item.symbol === (focusedSymbol ?? activeSymbol)}
                    onChange={v => onRateChange?.(item.symbol, v)}
                    onActivate={() => setFocusedSymbol(item.symbol)}
                    onDeactivate={() => setFocusedSymbol(null)}
                />
            )}
        />
    );
}
