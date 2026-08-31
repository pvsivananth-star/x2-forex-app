import React from 'react';
import {Pressable, Text} from 'react-native';
import {styles} from './RefreshButton.styles';

export function RefreshButton({onPress}: { onPress?: () => void }) {
    return <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Refresh market data" hitSlop={8}><Text
        style={styles.icon}>↻</Text></Pressable>
}
