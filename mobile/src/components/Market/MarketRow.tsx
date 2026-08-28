import React from 'react';
import {Text, View} from 'react-native';
import {styles} from './MarketRow.styles';
import {MarketRate} from '../../models/market';
import {RateInput} from './RateInput';

export function MarketRow({item, editable = false, active = false, onChange, onActivate, onDeactivate}: {
    item: MarketRate;
    editable?: boolean;
    active?: boolean;
    onChange?: (n: number) => void;
    onActivate?: () => void;
    onDeactivate?: () => void
}) {
    return (
        <View style={styles.row}>
            <View style={styles.name}>
                <Text style={styles.symbol}>{item.displaySymbol ?? item.symbol}</Text>
                <Text style={styles.label}>{item.name}</Text>
            </View>

            {editable ? (
                <RateInput
                    value={item.value}
                    active={active}
                    onChange={onChange}
                    onActivate={onActivate}
                    onDeactivate={onDeactivate}
                />
            ) : (
                <Text>{item.value.toLocaleString(undefined, {maximumFractionDigits: 6})}</Text>
            )}
        </View>
    );
}

