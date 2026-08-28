import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {TabCategory} from '../../models/market';
import {styles} from './BottomTabs.styles';

const TABS: { key: TabCategory; label: string; icon?: string }[] = [
    { key: 'dashboard', label: 'Welcome', icon: '★' },
    { key: 'fx', label: 'FX', icon: 'FX' },
    { key: 'equity', label: 'EQ', icon: 'EQ' },
    { key: 'crypto', label: '', icon: '₿' },
    { key: 'metals', label: 'AU', icon: 'Au' },
    { key: 'portfolio', label: '', icon: '📊' },
];

export function BottomTabs({activeTab, onChange}: { activeTab: TabCategory; onChange: (tab: TabCategory) => void }) {
    return (
        <View style={styles.root}>
            {TABS.map((t) => (
                <Pressable
                    key={t.key}
                    onPress={() => onChange(t.key)}
                    accessibilityRole="tab"
                    accessibilityState={{selected: activeTab === t.key}}
                    style={styles.tab}
                >
                    <Text style={{fontWeight: activeTab === t.key ? '800' : '400'}}>{t.icon ?? t.label}</Text>
                    {/* Show label only when provided (labels requested to be bottom-only) */}
                    {t.label ? <Text style={styles.label}>{t.label}</Text> : null}
                </Pressable>
            ))}
        </View>
    );
}

