import React from 'react';
import {Pressable, Text} from 'react-native';

export function RefreshButton({onPress}: { onPress?: () => void }) {
    return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Refresh market data" hitSlop={8}><Text
        style={{fontSize: 20}}>↻</Text></Pressable>
}
