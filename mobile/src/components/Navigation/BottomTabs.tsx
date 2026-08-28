import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {TabCategory} from '../../models/market';

const TABS: { key: TabCategory; label: string }[] = [{key: 'dashboard', label: 'Dashboard'}, {
    key: 'fx',
    label: 'Forex'
}, {key: 'crypto', label: 'Crypto'}, {key: 'metals', label: 'Metals'}, {key: 'equity', label: 'EQ'}, {
    key: 'portfolio',
    label: 'Portfolio'
}];

export function BottomTabs({activeTab, onChange}: { activeTab: TabCategory; onChange: (tab: TabCategory) => void }) {
    return <View style={styles.root}>{TABS.map(t => <Pressable key={t.key} onPress={() => onChange(t.key)}
                                                               accessibilityRole="tab"
                                                               accessibilityState={{selected: activeTab === t.key}}
                                                               style={styles.tab}><Text
        style={{fontWeight: activeTab === t.key ? '800' : '400'}}>{t.label}</Text></Pressable>)}</View>
}

const styles = StyleSheet.create({
    root: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#E2E2E2',
        paddingVertical: 8
    }, tab: {flex: 1, alignItems: 'center'}
});
