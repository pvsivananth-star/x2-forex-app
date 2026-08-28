import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {styles} from '../AppHeader.styles';
import {ConnectionIndicator} from './ConnectionIndicator';
import {RefreshButton} from './RefreshButton';
import {useMobileStore} from '../../state/marketStore';

export function AppHeader({title, onMenuPress}: { title: string; onMenuPress?: () => void }) {
    const online = useMobileStore(s => s.isOnline);
    const refresh = useMobileStore(s => s.forceRefresh);
    return <View style={styles.root}><Pressable onPress={onMenuPress} accessibilityRole="button"
                                                accessibilityLabel="Open menu"><Text
        style={styles.menu}>☰</Text></Pressable><Text style={styles.title}>{title}</Text><View
        style={styles.actions}><ConnectionIndicator online={online}/><RefreshButton
        onPress={() => void refresh()}/></View></View>;
}

