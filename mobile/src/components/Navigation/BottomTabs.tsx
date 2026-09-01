import React from 'react';
import {Pressable, Text, View} from 'react-native';

import {TabCategory} from '../../models';
import {styles} from './BottomTabs.styles';

interface TabColors {
    muted: string;
    border: string;
    accent: string;
    surface: string;
}

interface Props {
    activeTab: TabCategory;
    onChange: (tab: TabCategory) => void;
    colors: TabColors;
}

const TABS: {key: TabCategory; label: string}[] = [
    {key: 'fx', label: 'Fx'},
    {key: 'equity', label: 'Eq'},
    {key: 'crypto', label: 'Cr'},
    {key: 'metals', label: 'Au'},
    {key: 'portfolio', label: 'PF'},
];

export function BottomTabs({activeTab, onChange, colors}: Props) {
    return (
        <View
            style={[
                styles.root,
                {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },
            ]}
        >
            {TABS.map((tab) => {
                const active = activeTab === tab.key;

                return (
                    <Pressable
                        key={tab.key}
                        onPress={() => onChange(tab.key)}
                        accessibilityRole="tab"
                        accessibilityState={{selected: active}}
                        style={styles.tab}
                    >
                        <Text
                            style={[
                                styles.label,
                                {
                                    color: active ? colors.accent : colors.muted,
                                    fontWeight: active ? '900' : '800',
                                },
                            ]}
                        >
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
