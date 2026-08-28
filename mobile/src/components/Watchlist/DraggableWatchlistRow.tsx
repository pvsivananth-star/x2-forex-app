import React from 'react';
import {Text, View} from 'react-native';

export function DraggableWatchlistRow({symbol}: { symbol: string }) {
    return <View><Text>{symbol}</Text></View>
}
