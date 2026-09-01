import React from 'react';
import {Pressable, Text, View} from 'react-native';

import {PortfolioCategory} from '../../models';
import {AppColors} from '../../theme';
import {styles} from './PortfolioTabs.styles';

interface PortfolioTab {
    key: PortfolioCategory;
    code: string;
    label: string;
}

interface Props {
    activeCategory: PortfolioCategory;
    onChange: (category: PortfolioCategory) => void;
    colors: AppColors;
}

const TABS: PortfolioTab[] = [
    {key: 'overview', code: '*', label: 'All / Overview'},
    {key: 'bank', code: 'BK', label: 'Bank'},
    {key: 'market', code: 'MK', label: 'Market'},
    {key: 'fixedIncome', code: 'FI', label: 'Fixed Income'},
    {key: 'land', code: 'LD', label: 'Land'},
    {key: 'commodity', code: 'CM', label: 'Commodity'},
];

export function PortfolioTabs({activeCategory, onChange, colors}: Props) {
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
                const active = activeCategory === tab.key;

                return (
                    <Pressable
                        key={tab.key}
                        onPress={() => onChange(tab.key)}
                        accessibilityRole="tab"
                        accessibilityLabel={tab.label}
                        accessibilityState={{selected: active}}
                        style={styles.tab}
                    >
                        <Text
                            style={[
                                styles.code,
                                {
                                    color: active ? colors.accent : colors.muted,
                                    fontWeight: active ? '900' : '800',
                                },
                            ]}
                        >
                            {tab.code}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
