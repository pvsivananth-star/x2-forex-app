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

const ACTIVE_COLOR = '#E58A24';

export function PortfolioTabs({
    activeCategory,
    onChange,
    colors,
}: Props) {
    return (
        <View
            style={[
                styles.root,
                {
                    backgroundColor: colors.surface,
                    borderBottomColor: colors.border,
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
                        style={[
                            styles.tab,
                            active && {
                                backgroundColor: ACTIVE_COLOR,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.code,
                                {
                                    color: active
                                        ? '#FFFFFF'
                                        : colors.muted,
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
