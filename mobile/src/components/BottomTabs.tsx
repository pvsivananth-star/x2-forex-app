import React from 'react';

import {Text, TouchableOpacity, View,} from 'react-native';
import {styles, themed} from './BottomTabs.styles';

import {TabCategory,} from '../types';

import {AppColors,} from '../theme';

interface BottomTabsProps {
    activeTab: TabCategory;
    colors: AppColors;
    onChange: (
        tab: TabCategory,
    ) => void;
}

const TABS: {
    key: TabCategory;
    label: string;
    icon: string;
}[] = [
    {
        key: 'fx',
        label: 'Forex',
        icon: 'FX',
    },
    {
        key: 'equity',
        label: 'EQ',
        icon: 'EQ',
    },
    {
        key: 'crypto',
        label: 'Crypto',
        icon: '₿',
    },
    {
        key: 'metals',
        label: 'Metals',
        icon: 'Au',
    },
    {
        key: 'portfolio',
        label: 'Portfolio',
        icon: '▦',
    },
];

export const BottomTabs: React.FC<
    BottomTabsProps
> = ({
         activeTab,
         colors,
         onChange,
     }) => {
    const s = themed(colors);

    return (
        <View style={s.container}>
            {TABS.map((tab) => {
                const active = activeTab === tab.key;

                return (
                    <TouchableOpacity
                        key={tab.key}
                        accessibilityRole="tab"
                        accessibilityState={{selected: active}}
                        onPress={() => onChange(tab.key)}
                        style={s.tab}
                    >
                        <View style={active ? {...s.iconContainer, backgroundColor: colors.accentStrong} : s.iconContainer}>
                            <Text style={active ? s.iconActive : s.iconInactive(colors)}>{tab.icon}</Text>
                        </View>

                        <Text style={active ? s.labelActive(colors) : s.labelInactive(colors)}>{tab.label}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

