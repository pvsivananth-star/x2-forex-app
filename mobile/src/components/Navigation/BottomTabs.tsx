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

const TABS: {key: TabCategory; icon: string}[] = [
    {key: 'fx', icon: 'FX'},
    {key: 'equity', icon: 'EQ'},
    {key: 'crypto', icon: '₿'},
    {key: 'metals', icon: 'Au'},
    {key: 'portfolio', icon: '◔'},
];

const PORTFOLIO_ACTIVE_COLOR = '#E58A24';

export function BottomTabs({
    activeTab,
    onChange,
    colors,
}: Props) {
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
                const activeColor =
                    tab.key === 'portfolio'
                        ? PORTFOLIO_ACTIVE_COLOR
                        : colors.accent;

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
                                active
                                    ? styles.iconActive
                                    : styles.iconInactive,
                                {
                                    color: active
                                        ? activeColor
                                        : colors.muted,
                                },
                            ]}
                        >
                            {tab.icon}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
