import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {TabCategory} from '../../models';
import {AppColors} from '../../theme';
import {styles} from './BottomTabs.styles';

const TABS: {key: TabCategory; icon: string}[] = [
    {key: 'fx', icon: 'FX'},
    {key: 'equity', icon: 'EQ'},
    {key: 'crypto', icon: '₿'},
    {key: 'metals', icon: 'Au'},
    {key: 'portfolio', icon: '📊'},
];

export function BottomTabs({activeTab, onChange, colors}: {activeTab: TabCategory; onChange: (tab: TabCategory) => void; colors?: AppColors}) {
    void colors;
    return (
        <View style={styles.root}>
            {TABS.map((t) => {
                const active = activeTab === t.key;
                return (
                    <Pressable
                        key={t.key}
                        onPress={() => onChange(t.key)}
                        accessibilityRole="tab"
                        accessibilityState={{selected: active}}
                        style={styles.tab}
                    >
                        <Text style={active ? styles.iconActive : styles.iconInactive}>{t.icon}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
